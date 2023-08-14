export type RowData = {
  key: string;
  value: string;
};

export type OutputFile = {
  fileId: string;
  local: RowData[];
  session: RowData[];
};

export interface Requset {
  method: string;
  type: string;
  value?: any;
}
