/**
 * Live Shop & CF Order Engine Types
 * สามหมอกโค้ดดิ้ง - ระบบจัดการร้านค้าไลฟ์สด & ดูดออเดอร์ CF อัตโนมัติ
 */

export interface ShopInfoStep1 {
  shopName: string;
  phone: string;
  country: string;
  address: string;
  subdistrict: string;
  postalCode: string;
  tiktokUsername: string;
  isTiktokVerified?: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  promptPayNumber?: string;
  qrCodeUrl?: string;
  isDefault?: boolean;
}

export interface AutoReminderConfig {
  enabled: boolean;
  timesPerDay: number; // e.g. 4 times: 19:00, 20:00, 21:00, 22:00
  scheduleHours: string[]; // e.g. ["19:00", "20:00", "21:00", "22:00"]
  timeUnit: 'day' | 'hour';
  unitDuration: string; // e.g. "+08:00"
}

export interface AutoCutoffConfig {
  enabled: boolean;
  notifyCustomer: boolean;
  cutoffTime: string; // e.g. "12:00"
  cutoffDayRule: 'same_day' | 'next_day' | 'within_24h';
}

export interface AutoBlockConfig {
  enabled: boolean;
  maxFailedCount: number; // e.g. CF ครบ 4 ครั้งแล้วไม่โอน
  notifyBlockedMessage: boolean;
  customMessage?: string;
}

export interface PaymentAndCFRulesStep2 {
  bankAccounts: BankAccount[];
  autoReminder: AutoReminderConfig;
  autoCutoff: AutoCutoffConfig;
  autoBlock: AutoBlockConfig;
  cashOnDelivery: boolean; // เก็บเงินปลายทาง (COD)
  combineShipping: boolean; // รวมค่าเสื้อซื้อ (ถ้าเป็น)
  pullDetailsBeforeNextCF: boolean; // ดึงเนื้อหาก่อน CF ชิ้นต่อไป
  autoSlipVerify: boolean; // ตรวจสลิปอัตโนมัติ (Slip Verify)
}

export interface ShippingMethod {
  id: string;
  name: string;
  code: 'jnt' | 'flash' | 'ems' | 'deposit' | 'custom';
  enabled: boolean;
  isFreeShipping: boolean;
  baseCost: number;
  perAdditionalItemCost: number;
  note?: string;
}

export interface ShippingStep3 {
  methods: ShippingMethod[];
}

export interface LiveProductItem {
  id: string;
  code: string; // e.g. "A01", "ถั่วลายเสือ" (รหัส CF)
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  productType: 'single' | 'variants' | 'second_hand_batch';
  variants?: {
    color?: string;
    size?: string;
    stock: number;
    price?: number;
  }[];
}

export interface LiveShopWizardState {
  currentStep: 1 | 2 | 3 | 4;
  step1: ShopInfoStep1;
  step2: PaymentAndCFRulesStep2;
  step3: ShippingStep3;
  products: LiveProductItem[];
  isConfirmed: boolean;
}

export const INITIAL_LIVE_SHOP_STATE: LiveShopWizardState = {
  currentStep: 1,
  step1: {
    shopName: "สามหมอกโค้ดดิ้ง",
    phone: "0807107058",
    country: "ไทย",
    address: "41/2 M 5",
    subdistrict: "ปางหมู เมืองแม่ฮ่องสอน แม่ฮ่องสอน",
    postalCode: "58000",
    tiktokUsername: "",
    isTiktokVerified: false,
  },
  step2: {
    bankAccounts: [
      {
        id: "bank-1",
        bankName: "ธนาคารกสิกรไทย",
        accountNumber: "0141219623",
        accountName: "อริสรา ศรีมณี",
        isDefault: true,
      },
    ],
    autoReminder: {
      enabled: true,
      timesPerDay: 4,
      scheduleHours: ["19:00", "20:00", "21:00", "22:00"],
      timeUnit: "hour",
      unitDuration: "+08:00",
    },
    autoCutoff: {
      enabled: true,
      notifyCustomer: true,
      cutoffTime: "12:00",
      cutoffDayRule: "within_24h",
    },
    autoBlock: {
      enabled: true,
      maxFailedCount: 4,
      notifyBlockedMessage: false,
    },
    cashOnDelivery: false,
    combineShipping: false,
    pullDetailsBeforeNextCF: false,
    autoSlipVerify: false,
  },
  step3: {
    methods: [
      {
        id: "ship-1",
        name: "J&T Express",
        code: "jnt",
        enabled: true,
        isFreeShipping: false,
        baseCost: 40,
        perAdditionalItemCost: 10,
      },
      {
        id: "ship-2",
        name: "Flash Express",
        code: "flash",
        enabled: true,
        isFreeShipping: false,
        baseCost: 40,
        perAdditionalItemCost: 10,
      },
      {
        id: "ship-3",
        name: "Thailand Post EMS",
        code: "ems",
        enabled: false,
        isFreeShipping: false,
        baseCost: 50,
        perAdditionalItemCost: 10,
      },
      {
        id: "ship-4",
        name: "ฝากของ (รอรวมส่ง)",
        code: "deposit",
        enabled: false,
        isFreeShipping: true,
        baseCost: 0,
        perAdditionalItemCost: 0,
      },
    ],
  },
  products: [
    {
      id: "prod-1",
      code: "ถั่วลายเสือ",
      name: "ถั่วลายเสือคั่วธรรมชาติ (สินค้า OTOP แม่ฮ่องสอน)",
      description: "ถั่วลายเสือคั่วกรอบ หอม มัน สดใหม่จากเมืองแม่ฮ่องสอน",
      category: "อาหาร/ของฝาก",
      price: 120,
      stock: 50,
      images: [],
      productType: "single",
    },
  ],
  isConfirmed: false,
};
