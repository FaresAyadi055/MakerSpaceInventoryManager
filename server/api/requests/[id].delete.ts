import { defineEventHandler, getRouterParam, createError } from 'h3'
import mongoose from 'mongoose'
import Request from '~/server/models/Requests'
import connectDB from '~/server/utils/db'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    // Get request ID from URL parameter - note: it's 'email' in params!
    const requestIdString = getRouterParam(event, 'email')

    if (!requestIdString) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request ID is required'
      })
    }

    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(requestIdString)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request ID format'
      })
    }

    // Get current user
    const currentUser = getCurrentUser(event)
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - No user context'
      })
    }


    // Find the request
    const request = await Request.findById(requestIdString)
    
    if (!request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Request not found'
      })
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: `Only pending requests can be cancelled. Current status: ${request.status}`
      })
    }

    // Check authorization
    const isOwner = request.user_id.toString() === currentUser.userId
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin'

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not authorized to delete this request'
      })
    }

    // Delete the request
    await Request.findByIdAndDelete(requestIdString)

    return {
      success: true,
      message: 'Request deleted successfully',
      data: {
        id: requestIdString,
        deleted: true
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error deleting request:', error)
    
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete request'
    })
  }
})