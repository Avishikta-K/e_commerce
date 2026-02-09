const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Helper to read users
const getUsers = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper to save users
const saveUsers = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

class User {
    constructor(data) {
        this._id = data._id || Date.now().toString(); // Simple ID generation
        this.name = data.name || 'Fashion Enthusiast';
        this.email = data.email;
        this.mobile = data.mobile || "";
        this.dob = data.dob || "";
        this.bloodGroup = data.bloodGroup || "";
        this.address = data.address || "";
        this.avatar = data.avatar || "";
        this.createdAt = data.createdAt || new Date();
        this.loginHistory = data.loginHistory || [];
    }

    // Mimic Mongoose .save()
    async save() {
        const users = getUsers();
        const existingIndex = users.findIndex(u => u._id === this._id);

        if (existingIndex >= 0) {
            users[existingIndex] = this; // Update
        } else {
            users.push(this); // Create
        }

        saveUsers(users);
        return this;
    }

    // Mimic Mongoose .findOne()
    static async findOne(query) {
        const users = getUsers();
        // Simple mock for finding by email
        const user = users.find(u => u.email === query.email);
        return user ? new User(user) : null;
    }

    // Mimic Mongoose .findById()
    static async findById(id) {
        const users = getUsers();
        const user = users.find(u => u._id === id);
        return user ? new User(user) : null;
    }

    // Mimic Mongoose .find() (for admin route)
    static async find() {
        const users = getUsers();
        return {
            sort: () => users // Simple mock that just returns users
        };
    }
}

module.exports = User;