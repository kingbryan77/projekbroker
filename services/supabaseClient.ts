
// MOCK SUPABASE CLIENT FOR FRONTEND SIMULATION
// This file replaces the real @supabase/supabase-js client to allow the app to function 
// without a real backend connection. It uses localStorage to persist data.

const STORAGE_KEYS = {
  AUTH: 'supabase_mock_auth',
  DB_PREFIX: 'supabase_mock_db_',
};

// Initial Seed Data
const INITIAL_DATA = {
  profiles: [
    {
      id: 'admin-user-id',
      email: 'panggilajabryan@gmail.com',
      full_name: 'Admin User',
      username: 'admin',
      phone_number: '081234567890',
      is_admin: true,
      is_verified: true,
      balance: 1000000000,
      profile_picture_url: null,
    },
    {
      id: 'member-user-id',
      email: 'amboali89@gmail.com',
      full_name: 'Amboali 89',
      username: 'amboali89',
      phone_number: '08987654321',
      is_admin: false,
      is_verified: true,
      balance: 13000000,
      profile_picture_url: null,
    },
    {
      id: 'member-demo-id',
      email: 'member@gmail.com',
      full_name: 'Member Demo',
      username: 'memberdemo',
      phone_number: '08111222333',
      is_admin: false,
      is_verified: true,
      balance: 50000000,
      profile_picture_url: null,
    },
    {
      id: 'test-user-20jt',
      email: 'test@member.com',
      full_name: 'Test Member 20Jt',
      username: 'test20jt',
      phone_number: '081222333444',
      is_admin: false,
      is_verified: true,
      balance: 20000000,
      profile_picture_url: null,
    }
  ],
  company_bank_info: [
     { id: 'bank-1', bank_name: 'Bank Central Asia (BCA)', account_number: '1234567890', account_holder_name: 'PT FOREXIMF' },
     { id: 'bank-2', bank_name: 'Bank Mandiri', account_number: '0987654321', account_holder_name: 'PT FOREXIMF' },
     { id: 'bank-3', bank_name: 'BNI', account_number: '1891316499', account_holder_name: 'DEVI SUPARMAN' },
     { id: 'bank-4', bank_name: 'BRI', account_number: '052101029956501', account_holder_name: 'MAULANA MUHAMMAD DHANY' }
  ],
  transactions: [],
  notifications: []
};

// Helper to get/set DB
const getTable = (tableName: string) => {
  const key = STORAGE_KEYS.DB_PREFIX + tableName;
  const stored = localStorage.getItem(key);
  if (!stored) {
    // Seed initial data if missing
    if ((INITIAL_DATA as any)[tableName]) {
      localStorage.setItem(key, JSON.stringify((INITIAL_DATA as any)[tableName]));
      return (INITIAL_DATA as any)[tableName];
    }
    return [];
  }
  return JSON.parse(stored);
};

const saveTable = (tableName: string, data: any[]) => {
  const key = STORAGE_KEYS.DB_PREFIX + tableName;
  localStorage.setItem(key, JSON.stringify(data));
};

// Query Builder Class
class MockQueryBuilder {
  tableName: string;
  filters: any[];
  orders: any[];
  limitVal: number | null;
  singleResult: boolean;
  operation: string;
  updateData: any;
  insertData: any;
  
  constructor(tableName: string) {
    this.tableName = tableName;
    this.filters = [];
    this.orders = [];
    this.limitVal = null;
    this.singleResult = false;
    this.operation = 'SELECT';
    this.updateData = null;
    this.insertData = null;
  }

  select(columns: string = '*') {
    // If operation is already set (e.g. INSERT), select just means we return data.
    // If operation is default (SELECT), it remains SELECT.
    return this;
  }

  insert(data: any | any[]) {
    this.operation = 'INSERT';
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.operation = 'UPDATE';
    this.updateData = data;
    return this;
  }
  
  delete() {
    this.operation = 'DELETE';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
      this.filters.push({ column, operator: 'neq', value });
      return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orders.push({ column, ascending });
    return this;
  }
  
  limit(n: number) {
      this.limitVal = n;
      return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  // Implementation of then to make it Thenable/PromiseLike with correct signature
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): PromiseLike<TResult1 | TResult2> {
    const promise = new Promise((resolve, reject) => {
        try {
            let data = getTable(this.tableName);

            // 1. Handle INSERT first as it adds data
            if (this.operation === 'INSERT') {
                const itemsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
                const newItems = itemsToInsert.map((item: any) => ({
                    ...item,
                    id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
                }));
                const updatedTable = [...data, ...newItems];
                saveTable(this.tableName, updatedTable);
                // For INSERT, result is the inserted data
                data = newItems;
            } else {
                // For SELECT, UPDATE, DELETE - start with existing data and filter
                
                // Apply Filters
                for (const filter of this.filters) {
                    if (filter.operator === 'eq') {
                    data = data.filter((row: any) => row[filter.column] === filter.value);
                    } else if (filter.operator === 'neq') {
                    data = data.filter((row: any) => row[filter.column] !== filter.value);
                    }
                }

                if (this.operation === 'UPDATE') {
                    const allData = getTable(this.tableName);
                    const updatedAllData = allData.map((row: any) => {
                        let matches = true;
                        for (const filter of this.filters) {
                            if (filter.operator === 'eq' && row[filter.column] !== filter.value) matches = false;
                            if (filter.operator === 'neq' && row[filter.column] === filter.value) matches = false;
                        }
                        
                        if (matches) {
                            return { ...row, ...this.updateData };
                        }
                        return row;
                    });
                    saveTable(this.tableName, updatedAllData);
                    // Return updated rows
                    data = updatedAllData.filter((row: any) => {
                        let matches = true;
                        for (const filter of this.filters) {
                            if (filter.operator === 'eq' && row[filter.column] !== filter.value) matches = false;
                            if (filter.operator === 'neq' && row[filter.column] === filter.value) matches = false;
                        }
                        return matches;
                    });
                } else if (this.operation === 'DELETE') {
                    const allData = getTable(this.tableName);
                    const keptData = allData.filter((row: any) => {
                        let matches = true;
                        for (const filter of this.filters) {
                            if (filter.operator === 'eq' && row[filter.column] !== filter.value) matches = false;
                            if (filter.operator === 'neq' && row[filter.column] === filter.value) matches = false;
                        }
                        return !matches;
                    });
                    saveTable(this.tableName, keptData);
                    // Delete returns null unless select is chained in real supabase, but here we return null to mimic basic delete
                    data = null; 
                }
            }

            // Post-processing (Sort, Limit, Single) - Only relevant if data is not null
            if (data && Array.isArray(data)) {
                // Apply Sort
                for (const order of this.orders) {
                    data.sort((a: any, b: any) => {
                    if (a[order.column] < b[order.column]) return order.ascending ? -1 : 1;
                    if (a[order.column] > b[order.column]) return order.ascending ? 1 : -1;
                    return 0;
                    });
                }
                
                if (this.limitVal !== null) {
                    data = data.slice(0, this.limitVal);
                }

                if (this.singleResult) {
                    if (data.length === 0) {
                       resolve({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
                       return;
                    }
                    resolve({ data: data[0], error: null });
                    return;
                }
            }
            
            resolve({ data: data, error: null });

        } catch (e) {
            reject({ data: null, error: e });
        }
    });

    return promise.then(onfulfilled, onrejected);
  }
}

// Auth Simulation
const auth = {
  signInWithPassword: async ({ email, password }: any) => {
    // Find in profiles (simulating auth table)
    const profiles = getTable('profiles');
    const user = profiles.find((u: any) => u.email === email);
    
    // Simple password check (In real app, passwords are hashed. Here, mock passwords.)
    let isValid = false;
    if (user) {
        if (email === 'panggilajabryan@gmail.com' && password === 'admin') isValid = true;
        else if (email === 'amboali89@gmail.com' && password === 'password123') isValid = true;
        else if (email === 'member@gmail.com' && password === 'member123') isValid = true;
        else if (email === 'test@member.com' && password === '123456') isValid = true;
        else if (user) isValid = true; // Allow any password for other registered users in this mock
    }

    if (isValid && user) {
      const session = {
        user: { id: user.id, email: user.email },
        access_token: 'mock-token',
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      return { data: { user: session.user, session }, error: null };
    } else {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }
  },

  signUp: async ({ email, password }: any) => {
      // Check if exists
      const profiles = getTable('profiles');
      if (profiles.find((p: any) => p.email === email)) {
          return { data: { user: null }, error: { message: 'User already exists' } };
      }
      
      const newUser = {
          id: crypto.randomUUID(),
          email: email
      };
      
      return { data: { user: newUser }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    return { error: null };
  },

  getSession: async () => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      return { data: { session: JSON.parse(stored) }, error: null };
    }
    return { data: { session: null }, error: null };
  },
  
  onAuthStateChange: (callback: any) => {
      // Minimal mock
      return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

export const supabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: auth,
};
