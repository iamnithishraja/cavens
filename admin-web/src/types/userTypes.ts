export interface User {
    role: 'admin' | 'user' |  'club' ;
    isVerified?: boolean;
    // ...other properties as needed
  } 