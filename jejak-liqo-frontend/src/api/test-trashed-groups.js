// Test file untuk trashed groups API
import groupsAPI from './groups';

export const testTrashedGroupsAPI = async () => {
  try {
    console.log('Testing trashed groups API...');
    
    // Test get trashed groups
    const response = await groupsAPI.getTrashedGroups();
    console.log('Trashed groups response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing trashed groups API:', error);
    throw error;
  }
};

// Test restore group
export const testRestoreGroup = async (groupId) => {
  try {
    console.log(`Testing restore group ${groupId}...`);
    
    const response = await groupsAPI.restoreGroup(groupId);
    console.log('Restore response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing restore group:', error);
    throw error;
  }
};

// Test force delete group
export const testForceDeleteGroup = async (groupId) => {
  try {
    console.log(`Testing force delete group ${groupId}...`);
    
    const response = await groupsAPI.forceDeleteGroup(groupId);
    console.log('Force delete response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error testing force delete group:', error);
    throw error;
  }
};