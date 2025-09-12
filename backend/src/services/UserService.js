import bcrypt from "bcryptjs";
import UserRepository from "../repositories/UserRepository.js";
import HelperFunction from "../utils/HelperFunction.js";
import ApiError from "../utils/ApiError.js";

class UserService {
  async registerUser(data, files) {
    if (!data) throw new ApiError(400, "Missing data");

    const {
      firstname,
      lastname,
      email,
      phone,
      password,
      role = "rider",
      license_number,
      license_expiry_date,
      aadhar_number,
    } = data;

    // ----------------- VALIDATIONS -----------------
    if (!firstname || !lastname || !email || !phone || !password) {
      throw new ApiError(400, "Missing required fields");
    }

    if (await UserRepository.findByEmail(email)) {
      throw new ApiError(409, "Email already registered");
    }
    if (await UserRepository.findByPhone(phone)) {
      throw new ApiError(409, "Phone already registered");
    }

    if (role === "driver") {
      if (!license_number || !license_expiry_date || !aadhar_number) {
        throw new ApiError(
          422,
          "Driver must provide license number, expiry date, and Aadhaar"
        );
      }
    }

    // ----------------- PASSWORD -----------------
    const password_hash = await bcrypt.hash(password, 10);

    // ----------------- CLOUDINARY UPLOADS -----------------
    let avatar_url = null;
    let license_url = null;
    let aadhar_url = null;

    if (files?.avatar?.[0]) {
      avatar_url = await HelperFunction.uploadToCloudinary(
        files.avatar[0],
        "avatars"
      );
    }

    if (role === "driver" && files?.license?.[0]) {
      license_url = await HelperFunction.uploadToCloudinary(
        files.license[0],
        "licenses"
      );
    }

    if (role === "driver" && files?.aadhar?.[0]) {
      aadhar_url = await HelperFunction.uploadToCloudinary(
        files.aadhar[0],
        "aadhars"
      );
    }

    // ----------------- USER PAYLOAD -----------------
    const userPayload = {
      firstname,
      lastname,
      email,
      phone,
      password_hash,
      role,
      avatar_url,
      license_number: role === "driver" ? license_number : null,
      license_url,
      license_expiry_date: role === "driver" ? license_expiry_date : null,
      aadhar_number: role === "driver" ? aadhar_number : null,
      aadhar_url,
    };

    return UserRepository.create(userPayload);
  }
}

export default new UserService();
