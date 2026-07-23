import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjullvzxjbkotaqywzfz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_d49YYL4bBeBENa6Ot2IJ2Q_YHwugOfs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);