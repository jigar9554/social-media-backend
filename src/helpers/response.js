class Response {
  static _response

  static get response() {
    return Response._response
  }

  error({ msg, field, ...other }) {
    return {
      status: false,
      msg,
      field,
      ...other,
    }
  }

  success({ msg, data, ...other }) {
    return {
      status: true,
      msg,
      field: '',
      data,
      ...other
    }
  }
}

module.exports = Response