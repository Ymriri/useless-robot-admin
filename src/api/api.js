import axios from 'axios';

let base = 'http://localhost:8880/robot/';

export const getMemberList = params => { return axios.get(`${base}getMemberList`, { params: params }); };

export const getGroupInfo = params => { return axios.get(`${base}getGroupInfo`, { params: params }); };

export const getGroupList = params => { return axios.get(`${base}getGroupList`, { params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };