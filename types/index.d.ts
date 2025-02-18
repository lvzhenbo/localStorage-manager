declare type RowData = {
  key: string;
  value: string;
};

declare type OutputFile = {
  fileId: string;
  local: RowData[];
  session: RowData[];
};

declare interface Requset {
  method: string;
  type: string;
  value?: any;
}
