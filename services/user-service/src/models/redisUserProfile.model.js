import { SchemaFieldTypes } from 'redis';

const RedisUserProfileSchema = {
    firstName: { type: SchemaFieldTypes.TEXT },
    lastName: { type: SchemaFieldTypes.TEXT },
    avatar: { type: SchemaFieldTypes.TEXT },
};

export default RedisUserProfileSchema;
