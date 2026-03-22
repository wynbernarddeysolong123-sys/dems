import { db } from "@/server/db/connection";

export const registrationRepository = {
  async register(data: {
    preRegData: any;
    addressData: any;
    qrData: any;
    accountData?: any;
  }) {
    return await db.transaction(async (trx) => {
      // 1. Insert into address_table
      const [address_id] = await trx("address_table").insert(data.addressData);

      // 2. Insert into qr_table
      const [qr_id] = await trx("qr_table").insert(data.qrData);

      // 3. Handle account information if provided
      let account_information_id = null;
      if (data.accountData) {
        const [acc_id] = await trx("account_information_table").insert(data.accountData);
        account_information_id = acc_id;
      }

      // 4. Update preRegData with the new IDs
      const finalPreRegData = {
        ...data.preRegData,
        address_id,
        qr_id,
        account_information_id,
      };

      // 5. Insert into pre_reg_table
      const [pre_reg_id] = await trx("pre_reg_table").insert(finalPreRegData);

      // 6. Update the child tables with pre_reg_id for the back-reference (if they have it)
      await trx("address_table").where({ address_id }).update({ pre_reg_id });
      await trx("qr_table").where({ qr_id }).update({ pre_reg_id });
      if (account_information_id) {
        await trx("account_information_table").where({ account_information_id }).update({ pre_reg_id });
      }

      return pre_reg_id;
    });
  },
};
