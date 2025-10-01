export type BucketConfig = {
  name: string;
  maxSizeMB: number;
  public?: boolean;
};

export const STORAGE_BUCKETS: Record<string, BucketConfig> = {
  'organisation-logo': {
    name: 'organisation-logo',
    maxSizeMB: 2,
    public: true,
  },
  'organisation-banner': {
    name: 'organisation-banner',
    maxSizeMB: 5,
    public: true,
  },
};

export default STORAGE_BUCKETS;
