/**
 * Azure AD（Entra ID）SPA 應用程式的 Application (client) ID。
 * 這是公開值，可以進 repo；不要建立或提交 client secret。
 *
 * 註冊步驟見 README「OneDrive 同步」。
 * 未填寫時，備份頁會顯示設定說明，不會嘗試登入。
 */
export const clientId = '994a6134-9076-4116-a2f0-28e34263f9a4';

export const loginRequest = {
  scopes: ['User.Read', 'Files.ReadWrite.AppFolder'],
};

/** Graph 上 App 專用資料夾內的備份檔名。 */
export const backupFileName = 'sgsz-planner-backup.json';
