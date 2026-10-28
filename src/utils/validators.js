const strictlyPositive = {
  validator: (v) => v > 0,
  message: 'La valeur doit être strictement positive',
};

module.exports = { strictlyPositive };