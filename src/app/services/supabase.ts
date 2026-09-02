import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://epaxyugtxwvxvyqsinho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2I3zgxrFS431KFoytAJ9cA_UZjo8lSU';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  readonly client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
}
