import { type LiveData } from '@toeverything/infra';

import type { QuickSearchItem } from '../types/item';

export type QuickSearchFunction<S, P> = (
  query: string
) => QuickSearchItem<S, P>[];

export interface QuickSearchSession<S, P> {
  items$: LiveData<QuickSearchItem<S, P>[]>;
  error$?: LiveData<any>;
  isLoading$?: LiveData<boolean>;
  loadingProgress$?: LiveData<number>;
  hasMore$?: LiveData<boolean>;

  query?: (query: string) => void;
  loadMore?: () => void;
  dispose?: () => void;
  beforeSubmit?: (item: QuickSearchItem<S, P>) => boolean;
}

export type QuickSearchSource<S, P> =
  | QuickSearchFunction<S, P>
  | QuickSearchSession<S, P>;

export type QuickSearchSourceItemType<Source> =
  Source extends QuickSearchSource<infer S, infer P>
    ? QuickSearchItem<S, P>
    : never;
