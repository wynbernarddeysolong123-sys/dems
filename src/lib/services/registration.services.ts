import * as QRCode from "qrcode";
import { registrationRepository } from "../repositories/registration.repository";
import bcrypt from "bcryptjs";

export const registrationService = {
  async registerUser(formData: any) {
    // 1. Hash the password if provided
    let hashedPassword = "";
    if (formData.password) {
      hashedPassword = await bcrypt.hash(formData.password, 10);
    }

    // 2. Prepare preRegData
    const preRegData = {
      f_name: formData.f_name,
      m_name: formData.m_name,
      l_name: formData.l_name,
      name_ext: formData.name_ext,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      place_of_birth: formData.place_of_birth,
      mother_maiden_name: formData.mother_maiden_name,
      contact_no: formData.contact_no,
      email_address: formData.email_address,
      password: hashedPassword,
      registered_as: formData.registered_as,
      civil_status: formData.civil_status,
      religion: formData.religion,
      occupation: formData.occupation,
      monthly_income: formData.monthly_income || 0,
      highest_education_attainment: formData.highest_education_attainment,
      indigenous_people: formData.is_ip === "Yes",
      "4ps_beneficiary": formData.is_4ps === "Yes",
      id_card_presented: formData.id_card_presented,
      id_card_number: formData.id_card_number,
      signature: formData.signature,
      profile_pic: formData.profile_pic,
      status: "pending",
    };

    // 3. Prepare addressData
    const addressData = {
      occupancy_type: formData.occupancy_type || "Owner", // Default or from form
      region: formData.region,
      province: formData.province,
      city_municipality: formData.city,
      barangay_id: formData.barangay_id || null, 
      house_block_number: formData.house_number,
      street: formData.street,
      sub_village: formData.subdivision,
      zip_code: formData.zip_code,
      purok_id: formData.purok_id || null,
    };

    // 4. Prepare accountData (optional)
    let accountData = null;
    if (formData.bank_Ewallet || formData.account_number) {
      accountData = {
        bank_Ewallet: formData.bank_Ewallet,
        account_name: formData.account_name,
        account_type: formData.account_type,
        account_number: formData.account_number,
        house_ownership: formData.house_ownership,
        shelter_damage_classification: formData.shelter_damage_classification,
      };
    }

    // 5. Generate QR Code
    const qrIdentifier = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrIdentifier);
    const qrData = {
      code: qrCodeBase64,
    };

    // 6. Call repository via transaction
    return await registrationRepository.register({
      preRegData,
      addressData,
      qrData,
      accountData,
    });
  },
};
