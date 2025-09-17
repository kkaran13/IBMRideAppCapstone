import { DataTypes } from "sequelize";
import { sequelize } from "../config/mysql.js";
import User from "./User.js";
import Vehicle from "./Vehicle.js";

const Ride = sequelize.define(
    "Ride",
    {
        ride_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        rider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "user_id",
            },
            onDelete: "RESTRICT",
        },
        driver_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "user_id",
            },
            onDelete: "RESTRICT",
        },
        vehicle_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "vehicles",
                key: "vehicle_id",
            },
            onDelete: "RESTRICT",
        },

        rating_id: {
            type: DataTypes.UUID,
            allowNull: true, 
        },

        pickup_address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        pickup_latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            defaultValue: null
        },
        pickup_longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            defaultValue: null
        },
        dropoff_address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dropoff_latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            defaultValue: null
        },
        dropoff_longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            defaultValue: null
        },

        fare: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        distance_km: {
            type: DataTypes.DECIMAL(8, 2),
            allowNull: true,
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        ride_status: {
            type: DataTypes.ENUM(
                "requested",
                "accepted",
                "driver_arrived",
                "ongoing",
                "completed",
                "cancelled",
                "timeout",
                "rejected"
            ),
            defaultValue: "requested",
        },

        otp: {
            type: DataTypes.CHAR(4),
            allowNull: true,
        },
        otp_verified_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        rejected_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "user_id",
            },
            onDelete: "SET NULL",
        },
        cancelled_by: {
            type: DataTypes.ENUM("rider", "driver", "admin"),
            allowNull: true,
        },
        cancellation_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        requested_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        accepted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        rejected_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        started_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelled_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        payment_method: {
            type: DataTypes.ENUM("cash", "card", "upi"),
            allowNull: true,
        },
        payment_status: {
            type: DataTypes.ENUM("pending", "completed", "failed"),
            defaultValue: "pending",
        },

        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: "rides",
        indexes: [
            { name: "idx_rider_id", fields: ["rider_id"] },
            { name: "idx_driver_id", fields: ["driver_id"] },
            { name: "idx_vehicle_id", fields: ["vehicle_id"] },
            { name: "idx_status", fields: ["ride_status"] },
            { name: "idx_requested_at", fields: ["requested_at"] },
            { name: "idx_pickup_location", fields: ["pickup_latitude", "pickup_longitude"] },
            { name: "idx_dropoff_location", fields: ["dropoff_latitude", "dropoff_longitude"] },
            { name: "idx_rider_status", fields: ["rider_id", "ride_status"] },
            { name: "idx_driver_status", fields: ["driver_id", "ride_status"] },
            { name: "idx_status_requested_at", fields: ["ride_status", "requested_at"] },
        ],
    }
);

Ride.belongsTo(User, { as: "Rider", foreignKey: "rider_id", onDelete: "RESTRICT" });
Ride.belongsTo(User, { as: "Driver", foreignKey: "driver_id", onDelete: "RESTRICT" });
Ride.belongsTo(Vehicle, { foreignKey: "vehicle_id", onDelete: "RESTRICT" });

User.hasMany(Ride, { as: "RidesAsRider", foreignKey: "rider_id" });
User.hasMany(Ride, { as: "RidesAsDriver", foreignKey: "driver_id" });
Vehicle.hasMany(Ride, { foreignKey: "vehicle_id" });

export default Ride;