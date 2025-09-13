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

}

export default new UserRepository();
