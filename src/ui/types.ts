export type ComponentDef = {
  [key: string]: string | ComponentDef[] | undefined;
  ux: string;
  items?: ComponentDef[];
}