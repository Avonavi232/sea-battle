export default {
  boardSize: 10,
  alphabete: 'abcdefghijklmnopqrstuvwxyz',
  apiUrl: process.env.NODE_ENV === 'production' ? 'https://mighty-gorge-21935.herokuapp.com' : 'http://192.168.2.54:5000'
};