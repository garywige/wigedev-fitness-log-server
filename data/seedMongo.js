const { isDoStatement } = require("typescript")

// empty current contents of database
use wfl
db.dropDatabase()

// create tables
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'hash', 'salt', 'role', 'created', 'emailVerified'],
            properties: {
                email: {
                    bsonType: 'string'
                },
                hash: {
                    bsonType: 'string'
                },
                salt: {
                    bsonType: 'string'
                },
                role: {
                    bsonType: 'string'
                },
                created: {
                    bsonType: 'date'
                },
                paidThrough: {
                    bsonType: 'date'
                },
                emailVerified: {
                    bsonType: 'bool'
                }
            }
        }
    }
})

db.createCollection('exercises', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['user_id', 'name'],
            properties: {
                user_id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string'
                }
            }
        }
    }
})

db.createCollection('cycles', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['user_id', 'name'],
            properties: {
                user_id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string'
                }
            }
        }
    }
})

db.createCollection('workouts', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['date', 'cycle_id'],
            properties: {
                date: {
                    bsonType: 'date'
                },
                cycle_id: {
                    bsonType: 'objectId'
                }
            }
        }
    }
})

db.createCollection('sets', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['workout_id', 'exercise_id', 'weight', 'unit', 'repsPrescribed'],
            properties: {
                workout_id: {
                    bsonType: 'objectId'
                },
                exercise_id: {
                    bsonType: 'objectId'
                },
                weight: {
                    bsonType: 'double'
                },
                unit: {
                    bsonType: 'string'
                },
                repsPrescribed: {
                    bsonType: 'double'
                },
                repsPerformed: {
                    bsonType: 'double'
                }
            }
        }
    }
})
