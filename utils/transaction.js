const Tournament = require('../models/Tournament');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ErrorResponse = require('./errorResponse');
exports.creditAccount = async (
  userId,
  tournamentId,
  amount,
  source,
  paymentProvider,
  refId,
  description,
  walletFlag,
  paymentId,
  status,
  category
) => {
  let updatedWallet, walletHolder;
  if (category == 'USER') {
    walletHolder = await User.findById(userId);
    if (!walletHolder) {
      throw new Error("We apologize, But we didn't find a user");
    }
    if (walletFlag) {
      updatedWallet = await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: amount } },
        { new: true }
      );
    }
  } else {
    walletHolder = await Tournament.findById(tournamentId);
    if (!walletHolder) {
      throw new Error("We apologize, But we didn't find a tournament");
    }
    if (walletFlag) {
      updatedWallet = await Tournament.findByIdAndUpdate(
        tournamentId,
        { $inc: { walletBalance: amount } },
        { new: true }
      );
    }
  }
  const transaction = await Transaction.create([
    {
      type: 'credit',
      amount,
      userId,
      tournamentId,
      paymentProvider,
      source,
      refId,
      paymentId,
      balanceBefore: walletFlag
        ? Number(walletHolder.walletBalance)
        : Number(walletHolder.walletBalance),
      balanceAfter: walletFlag
        ? Number(walletHolder.walletBalance) + Number(amount)
        : Number(walletHolder.walletBalance),
      description,
      status,
      category,
    },
  ]);
  return {
    status: true,
    statusCode: 201,
    message: 'Credit successful',
    data: { updatedWallet, transaction },
  };
};
exports.debitAccount = async (
  userId,
  tournamentId,
  amount,
  source,
  paymentProvider,
  refId,
  description,
  walletFlag,
  paymentId,
  status,
  category
) => {
  let updatedWallet, walletHolder;
  if (category == 'USER') {
    walletHolder = await User.findById(userId);
    if (!walletHolder) {
      return next(new ErrorResponse("We apologize, But we didn't find a user", 400));
    }
    if (walletFlag) {
      if (Number(walletHolder.walletBalance) < amount) {
        return {
          status: false,
          statusCode: 400,
          message: `User ${walletHolder.firstName} ${walletHolder.lastName} has insufficient balance`,
        };
      }

      updatedWallet = await User.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: -amount } },
        { new: true }
      );
    }
  } else {
    walletHolder = await Tournament.findById(tournamentId);
    if (!walletHolder) {
      return next(new ErrorResponse("We apologize, But we didn't find a Tournament", 400));
    }
    if (walletFlag) {
      if (Number(walletHolder.walletBalance) < amount) {
        return {
          status: false,
          statusCode: 400,
          message: `${walletHolder.name} has insufficient balance`,
        };
      }
      updatedWallet = await Tournament.findByIdAndUpdate(
        tournamentId,
        { $inc: { walletBalance: -amount } },
        { new: true }
      );
    }
  }
  const transaction = await Transaction.create([
    {
      type: 'debit',
      amount,
      userId,
      tournamentId,
      paymentProvider,
      source,
      refId,
      paymentId,
      balanceBefore: walletFlag
        ? Number(walletHolder.walletBalance)
        : Number(walletHolder.walletBalance),
      balanceAfter: walletFlag
        ? Number(walletHolder.walletBalance) - Number(amount)
        : Number(walletHolder.walletBalance),
      description,
      status,
      category,
    },
    ,
  ]);
  return {
    status: true,
    statusCode: 201,
    message: 'Debit successful',
    data: { updatedWallet, transaction },
  };
};
