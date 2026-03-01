import { defineEventHandler, getRequestHeader, createError } from 'h3'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { Magic } = require('@magic-sdk/admin')

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  try {
    
    const authHeader = getRequestHeader(event, 'authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    
    let magicSecretKey = process.env.MAGIC_SECRET_KEY || config.MAGIC_SECRET_KEY
    
    // If we have a token and Magic secret key, try to logout from Magic
    if (token && magicSecretKey) {
      try {
        // Decode token to get email (without verification)
        const base64Payload = token.split('.')[1]
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
        
        if (payload.email) {
          
          // Initialize Magic admin
          const magic = new Magic(magicSecretKey)
          
          // Find user by email and logout their Magic session
          // Note: This requires you to store magicIssuer in your user model
          const User = (await import('~/server/models/Users')).default
          const user = await User.findOne({ email: payload.email })
          
          if (user?.magicIssuer) {
            await magic.users.logoutByIssuer(user.magicIssuer)
          }
        }
      } catch (magicError) {
        console.error('Magic server logout error:', magicError)
        // Continue - client will handle cleanup anyway
      }
    }
    
    return {
      success: true,
      message: 'Logged out successfully'
    }
    
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: true,
      message: 'Logged out successfully'
    }
  }
})