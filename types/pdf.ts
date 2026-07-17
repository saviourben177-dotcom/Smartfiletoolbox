export interface PdfDocumentRef {
  uri: string;
  name: string;
  pageCount: number;
  size: number;
}

export interface PdfPageRange {
  from: number;
  to: number;
}
