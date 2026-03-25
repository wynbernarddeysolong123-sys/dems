export interface Purok {
    id: number;
    purok_name: string;
    barangay_id: number;
    purok_leader?: string;
    pickup_point_name?: string;
    created_at?: Date;
    updated_at?: Date;
}