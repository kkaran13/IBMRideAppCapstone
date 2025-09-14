import User from "../models/User.js";

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

  updatePassword = async (email, password_hash) => {
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

}

export default new UserRepository();
