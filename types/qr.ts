export type QrType = 'text' | 'url' | 'phone' | 'wifi' | 'email';

export interface QrTextFields {
  type: 'text';
  text: string;
}
export interface QrUrlFields {
  type: 'url';
  url: string;
}
export interface QrPhoneFields {
  type: 'phone';
  phone: string;
}
export interface QrEmailFields {
  type: 'email';
  email: string;
  subject: string;
  body: string;
}
export interface QrWifiFields {
  type: 'wifi';
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export type QrFields =
  | QrTextFields
  | QrUrlFields
  | QrPhoneFields
  | QrEmailFields
  | QrWifiFields;

export interface QrHistoryItem {
  id: string;
  type: QrType;
  label: string;
  payload: string;
  createdAt: number;
  direction: 'generated' | 'scanned';
}
