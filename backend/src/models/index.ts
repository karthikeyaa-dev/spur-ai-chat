'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Model, ModelCtor } from 'sequelize';
import process from 'process';
import configFile from '../config/sequelize-config';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = (configFile as any)[env];
const db: {
  [key: string]: any;
  sequelize?: Sequelize;
  Sequelize?: typeof Sequelize;
} = {};

let sequelize: Sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(
    config.database as string,
    config.username as string,
    config.password as string,
    config
  );
}

// Read all model files and import them
const modelFiles = fs
  .readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
      file.indexOf('.test.js') === -1 &&
      file.indexOf('.test.ts') === -1 &&
      file !== 'index.ts' &&
      file !== 'index.js'
    );
  });

// Import models dynamically
for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const modelModule = require(modelPath);
  
  // Handle both default exports and named exports
  let model = null;
  if (modelModule.default && typeof modelModule.default.initModel === 'function') {
    model = modelModule.default.initModel(sequelize);
  } else if (modelModule.initModel && typeof modelModule.initModel === 'function') {
    model = modelModule.initModel(sequelize);
  } else if (typeof modelModule === 'function') {
    model = modelModule(sequelize, DataTypes);
  } else if (modelModule.default && typeof modelModule.default === 'function') {
    model = modelModule.default(sequelize, DataTypes);
  }
  
  if (model && model.name) {
    db[model.name] = model;
  }
}

// Set up associations
Object.keys(db).forEach(modelName => {
  const model = db[modelName];
  if (model.associate && typeof model.associate === 'function') {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
