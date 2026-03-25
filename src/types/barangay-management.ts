export type Barangay = {
    id: number;
    barangay_name: string;
    barangay_captain_name: string | null;
    signature_brgy_captain: string | null;
    total_population: number;
    latitude: number | null;
    longitude: number | null;
    evacuation_needed: boolean;
    prone_type: string | null;
    created_at?: string;
    updated_at?: string;
};