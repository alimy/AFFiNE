import { ColorScheme } from '@blocksuite/affine-model';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { LifeCycleWatcher } from '@blocksuite/std';
import { type Signal, signal } from '@preact/signals-core';
import {
  createHighlighterCore,
  createOnigurumaEngine,
  type HighlighterCore,
  type MaybeGetter,
} from 'shiki';
import getWasm from 'shiki/wasm';

import { CodeBlockConfigExtension } from './code-block-config.js';
import {
  CODE_BLOCK_DEFAULT_DARK_THEME,
  CODE_BLOCK_DEFAULT_LIGHT_THEME,
} from './highlight/const.js';

export class CodeBlockHighlighter extends LifeCycleWatcher {
  static override key = 'code-block-highlighter';

  // Singleton highlighter instance
  private static _sharedHighlighter: HighlighterCore | null = null;
  private static _highlighterPromise: Promise<HighlighterCore> | null = null;
  private static _refCount = 0;

  private _darkThemeKey: string | undefined;
  private _lightThemeKey: string | undefined;

  highlighter$: Signal<HighlighterCore | null> = signal(null);

  get themeKey() {
    const theme = this.std.get(ThemeProvider).theme$.value;
    return theme === ColorScheme.Dark
      ? this._darkThemeKey
      : this._lightThemeKey;
  }

  private readonly _loadTheme = async (
    highlighter: HighlighterCore
  ): Promise<void> => {
    const config = this.std.getOptional(CodeBlockConfigExtension.identifier);
    const darkTheme = config?.theme?.dark ?? CODE_BLOCK_DEFAULT_DARK_THEME;
    const lightTheme = config?.theme?.light ?? CODE_BLOCK_DEFAULT_LIGHT_THEME;
    this._darkThemeKey = (await normalizeGetter(darkTheme)).name;
    this._lightThemeKey = (await normalizeGetter(lightTheme)).name;
    await highlighter.loadTheme(darkTheme, lightTheme);
    this.highlighter$.value = highlighter;
  };

  private static async _getOrCreateHighlighter(): Promise<HighlighterCore> {
    if (CodeBlockHighlighter._sharedHighlighter) {
      return CodeBlockHighlighter._sharedHighlighter;
    }

    if (!CodeBlockHighlighter._highlighterPromise) {
      CodeBlockHighlighter._highlighterPromise = createHighlighterCore({
        engine: createOnigurumaEngine(() => getWasm),
      }).then(highlighter => {
        CodeBlockHighlighter._sharedHighlighter = highlighter;
        return highlighter;
      });
    }

    return CodeBlockHighlighter._highlighterPromise;
  }

  override mounted(): void {
    super.mounted();

    CodeBlockHighlighter._refCount++;

    CodeBlockHighlighter._getOrCreateHighlighter()
      .then(this._loadTheme)
      .catch(console.error);
  }

  override unmounted(): void {
    CodeBlockHighlighter._refCount--;

    // Only dispose the shared highlighter when no instances are using it
    if (
      CodeBlockHighlighter._refCount === 0 &&
      CodeBlockHighlighter._sharedHighlighter
    ) {
      CodeBlockHighlighter._sharedHighlighter.dispose();
      CodeBlockHighlighter._sharedHighlighter = null;
      CodeBlockHighlighter._highlighterPromise = null;
    }
  }
}

/**
 * https://github.com/shikijs/shiki/blob/933415cdc154fe74ccfb6bbb3eb6a7b7bf183e60/packages/core/src/internal.ts#L31
 */
export async function normalizeGetter<T>(p: MaybeGetter<T>): Promise<T> {
  return Promise.resolve(typeof p === 'function' ? (p as any)() : p).then(
    r => r.default || r
  );
}
