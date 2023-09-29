export default interface PersonResponse {
    activeEmailVerificationCode: string | null;
    address: Address;
    addressId: number;
    ageInMonths: number;
    classPositions: ClassPosition[];
    commonName: string | null;
    creationTime: string;
    creatorPersonId: string | null;
    deleterPersonId: string | null;
    deletionTime: string | null;
    emailAddress: string;
    firstName: string;
    genderId: number;
    isActive: boolean;
    isDeleted: boolean;
    isEmailValidated: boolean;
    jurisdictions: Jurisdiction[];
    lastModificationTime: string | null;
    lastModifierPersonId: string | null;
    lastName: string;
    legalFirstName: string | null;
    legalLastName: string | null;
    mobilePhoneNumber: string;
    personId: number;
    personSetting: PersonSetting[];
    personSyncSetting: PersonSyncSetting[];
    positions: Position[];
  }
  
  interface Address {
    addressId: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    creationTime: string;
    country: string;
    isPrimary: boolean;
  }
  
  interface ClassPosition {
    areaCode: string | null;
    level: string;
    rank: number;
    isLead: boolean;
    name: string;
  }
  
  interface Jurisdiction {
    addonPositionId: number;
    jurisdictionName: string;
    jurisdictionType: string;
    jurisdictionId: number;
    isActive: boolean;
  }
  
  interface PersonSetting {
    personSettingKey: string;
    personSettingValue: string | boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  interface PersonSyncSetting {
    isSync: boolean;
    syncScopeId: number;
    syncScopeName: string;
    createdAt: string;
    updatedAt: string;
  }
  
  interface Position {
    abbreviation: string;
    name: string;
    type: string;
    positionId: number;
    isActive: boolean;
  }
  