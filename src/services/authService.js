import { useUserStore } from "@/stores/userStore";
import bcrypt from "bcryptjs";

export const authService = {
  hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  async registerUser(
    firstname,
    lastname,
    email,
    password,
    year,
    promotion,
    airtableService
  ) {
    const hashedPassword = this.hashPassword(password);
    const user = {
      Firstname: firstname,
      Lastname: lastname,
      Email: email,
      Password: hashedPassword,
      Year: year,
      Promotion: promotion,
      Roles: "Student",
    };

    const createdUser = await airtableService.createRecord("Users", user);

    const userStore = useUserStore();
    userStore.setUser({
      id: createdUser.id,
      firstname: createdUser.fields.Firstname,
      lastname: createdUser.fields.Lastname,
      email: createdUser.fields.Email,
      year: createdUser.fields.Year,
      promotion: createdUser.fields.Promotion,
      roles: createdUser.fields.Roles,
    });

    return createdUser;
  },

  async checkIfEmailExists(email, airtableService) {
    const users = await airtableService.getAllRecords("Users", {
      filterByFormula: `{Email} = "${email}"`,
    });

    return users.length > 0;
  },

  checkPassword(storedPassword, inputPassword) {
    return bcrypt.compareSync(inputPassword, storedPassword);
  },

  async loginUser(email, password, airtableService) {
    const emailExists = await this.checkIfEmailExists(email, airtableService);
    if (!emailExists) {
      console.error("Email not found");
      return null;
    }

    const users = await airtableService.getAllRecords("Users", {
      filterByFormula: `{Email} = "${email}"`,
    });
    const storedUser = users[0].fields;

    const isPasswordCorrect = this.checkPassword(storedUser.Password, password);
    if (!isPasswordCorrect) {
      console.error("Invalid password");
      return null;
    }

    const user = {
      id: users[0].id,
      firstname: storedUser.Firstname,
      lastname: storedUser.Lastname,
      email: storedUser["Email"],
      year: storedUser.Year,
      promotion: storedUser.Promotion,
      roles: storedUser.Roles,
    };

    const userStore = useUserStore();
    userStore.setUser(user);

    return user;
  },

  logoutUser() {
    const userStore = useUserStore();
    userStore.logout();
    return true;
  },
};
