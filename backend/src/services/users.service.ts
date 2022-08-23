import bcrypt from 'bcrypt';
import { CreateUserDto, UserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

class UserService {
  private users = userModel;

  public async findAllUser(): Promise<User[]> {
    const users: User[] = await this.users.find();
    return users;
  }

  public async findUserById(userId: string): Promise<UserDto> {
    if (isEmpty(userId)) throw new HttpException(400, 'Invalid user ID');

    const findUser: User = await this.users.findById(userId);
    if (!findUser) throw new HttpException(404, `User with ID '${userId}' not found`);

    const userDto = UserDto.createFrom(findUser);
    return userDto;
  }

  public async createUser(userData: CreateUserDto): Promise<UserDto> {
    const isUserDataIncomplete = isEmpty(userData) || isEmpty(userData.email) || isEmpty(userData.password);
    if (isUserDataIncomplete) throw new HttpException(400, 'Incomplete user data');

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(400, `Your email, ${userData.email}, already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const createUserData: User = await this.users.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: null,
    });
    const userDto = UserDto.createFrom(createUserData);
    return userDto;
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<UserDto> {
    if (isEmpty(userData)) throw new HttpException(400, 'Incomplete user data');

    if (userData.email) {
      const findUser: User = await this.users.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) throw new HttpException(409, `Your email, ${userData.email}, already exists`);
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById: User = await this.users.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUserById) throw new HttpException(404, `User with ID '${userId}' not found`);

    const userDto = UserDto.createFrom(updateUserById);
    return userDto;
  }

  public async deleteUser(userId: string): Promise<UserDto> {
    const deleteUserById: User = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(404, `User with ID '${userId}' not found`);

    const userDto = UserDto.createFrom(deleteUserById);
    return userDto;
  }
}

export default UserService;
