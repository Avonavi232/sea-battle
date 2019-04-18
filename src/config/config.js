export default {
  boardSize: 10,
  alphabete: 'abcdefghijklmnopqrstuvwxyz',
  apiUrl: process.env.NODE_ENV === 'production' ? ' ' : 'http://192.168.2.54:5000'
};