// server/api/test/db-test.ts
import { defineEventHandler, readBody } from 'h3'
import User from '~/server/models/Users'
import connectDB from '~/server/utils/db'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    // Connect to database
    await connectDB()
    
    // Test 1: Check connection
    const connectionState = mongoose.connection.readyState
    const connectionStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
    
    // Test 2: Try to create a test user
    const testEmail = `test${Date.now()}@medtech.tn`
    const newUser = await User.create({
      email: testEmail,
      role: 'student'
    })
    
    // Test 3: Try to find the user
    const foundUser = await User.findOne({ email: testEmail })
    
    // Test 4: List all users
    const allUsers = await User.find().limit(5)
    
    // Test 5: Check database info
    const dbInfo = {
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      collections: await mongoose.connection.db.listCollections().toArray()
    }
    
    return {
      success: true,
      connection: {
        state: connectionStates[connectionState],
        readyState: connectionState
      },
      database: dbInfo,
      test: {
        created: newUser ? { email: newUser.email, id: newUser._id } : null,
        found: foundUser ? { email: foundUser.email, id: foundUser._id } : null,
        allUsers: allUsers.map(u => ({ email: u.email, role: u.role }))
      },
      env: {
        hasMongoUri: !!process.env.MONGO_URI,
        mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'not set'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})