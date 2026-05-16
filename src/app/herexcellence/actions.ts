'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function joinWaitlist(prevState: any, formData: FormData) {
  try {
    // If the public RLS policy works, we use the standard client.
    // If we face issues, we could fallback to the service client, but standard is safer.
    const supabase = await createClient();

    const firstName = formData.get('firstName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const birthday = formData.get('birthday') as string;
    const location = formData.get('location') as string;
    const style = formData.get('style') as string;

    if (!firstName || !email || !phone || !location) {
      return { success: false, error: 'Please fill out all required fields.' };
    }

    const { data, error } = await supabase
      .from('her_excellence_waitlist')
      .insert([
        {
          first_name: firstName,
          email: email,
          phone_number: phone,
          birthday: birthday,
          location: location,
          personal_style: style,
        },
      ]);

    if (error) {
      if (error.code === '23505') { // Unique violation for email
        return { success: false, error: 'You are already on the waitlist with this email!' };
      }
      console.error('Supabase error:', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }

    revalidatePath('/herexcellence/dashboard');
    return { success: true, message: 'Welcome to Her Excellence. You are on the list.' };
  } catch (err: any) {
    console.error('Waitlist action error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function getWaitlistData() {
  try {
    // Use service client for dashboard to bypass RLS since the auth is just a fake frontend login
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('her_excellence_waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching waitlist:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching waitlist:', err);
    return [];
  }
}
