export interface ZipEntryInfo {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
}

export interface PickedZipSource {
  uri: string;
  name: string;
}
