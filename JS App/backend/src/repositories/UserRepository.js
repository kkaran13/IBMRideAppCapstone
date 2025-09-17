import User from "../models/User.js";
import { Op } from "sequelize";
class UserRepository {
  async findById(user_id) {
    return User.findByPk(user_id);
  }

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async findByPhone(phone) {
    return User.findOne({ where: { phone } });
  }

  async create(userData) {
    return User.create(userData);
  }

  // async update(uuid, updateData) {
  //   const user = await this.findById(uuid);
  //   if (!user) return null;
  //   return user.update(updateData);
  // }

  async updatePassword(email, password_hash) {
    return await User.update(
      { password_hash },
      { where: { email } }
    );
  };

  async updateById(id, updateFields) {
    const [affectedRows] = await User.update(updateFields, {
      where: { user_id: id },
    });

    return affectedRows; // returns number of rows updated
  }

  async delete(user_id) {
    const user = await this.findById(user_id);
    if (!user) return null;
    return user.destroy(); // soft delete if paranoid is true
  }

  async updateIsActive(user_id, account_status) {
    const [affectedRows] = await User.update(
      { account_status },
      { where: { user_id } }
    );
    if (affectedRows === 0) return null;
    return await User.findOne({ where: { user_id } });
  }
  
  async reactivate(user_id) {
    return await User.update(
      { account_status: "active" },
      { where: { user_id } }
    );
  }


// repository/userRepository.js
async findAllUsers() {
  return await User.findAndCountAll({
    order: [["created_at", "DESC"]],
       raw: true,  
  });
}


  async findUsersByVerificationStatus(status, driver_role, acc_status) {
    return await User.findAll({
      where: { verification_status: status, role: driver_role, account_status: acc_status },
      attributes: [
        "user_id",
        "license_number",
        "license_url",
        "license_expiry_date",
        "aadhar_number",
        "aadhar_url",
        "verification_status",
        "verification_notes",
      ],
    });
  }

  async updateVerificationStatus(userId, { status, notes, adminId }) {
    await User.update(
      {
        verification_status: status,      // update only status
        verification_notes: notes || null,
        verified_by: adminId,
        verified_at: new Date(),
      },
      { where: { user_id: userId } }
    );

    return await User.findOne({
      where: { user_id: userId },
      attributes: [
        "user_id",
        "verification_status",
        "verification_notes",
        "verified_by",
        "verified_at",
      ],
    });
  }



}

export default new UserRepository();
