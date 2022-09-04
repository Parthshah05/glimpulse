let jwt = require("jsonwebtoken");

const userService = require("../services/user.service");

//for create token
exports.assignToken = async (user, expires_in) => {
  let payload = {
    id: user._id,
  };
  let token = await jwt.sign(payload, process.env.JWT_SECRET, {});
  return token;
};

//for check-token
exports.verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Please send authentication token",
      });
    }
    if (token) {
      let decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      req.userData = decoded;
      if (decoded.id) {
        let user = await userService.getUserById(decoded.id);
        if (user) {
          req.userData.user = user;
        } else {
          return res.status(400).json({
            status: false,
            message: "User cant be access or not exist!",
          });
        }
      }
      next();
    }
  } catch (err) {
    return res.status(401).json({
      status: false,
      message: "Unauthenticated!",
    });
  }
};
