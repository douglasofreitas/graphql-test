import * as Sequelize from "sequelize";
import { BaseModelInterface } from "../interfaces/BaseModelInterface";

export interface UserAttribtes {
    if?: number;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
}

export interface UserInstance extends Sequelize.Instance<UserAttribtes>, UserAttribtes {
    isPassword(encodedPassword: string, password: string): boolean; 
}

export interface UserModel extends BaseModelInterface, Sequelize.Model<UserInstance, UserAttribtes> {}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): UserModel => {
    const User: UserModel = 
        sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(128),
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(128),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            photo: {
                type: DataTypes.BLOB({
                    length: 'long'
                }),
                allowNull: true,
                defaultValue: null
            }
        });
    return User;
} 