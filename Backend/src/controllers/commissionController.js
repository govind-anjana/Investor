// controllers/commissionController.js
import Commission from "../models/commissionModel.js";
import Partner from "../models/partnerModel.js";

export const createCommission = async (req, res) => {
  const { investorId, amount, partnerReferralCode } = req.body;

  let partner = null;
  let partnerCommission = 0;

  if (partnerReferralCode) {
    partner = await Partner.findOne({ referralCode: partnerReferralCode });
    if (partner) partnerCommission = amount * 0.05;
  }

  const adminEarning = amount - partnerCommission;

  const record = await Commission.create({
    investor: investorId,
    partner: partner ? partner._id : null,
    investmentAmount: amount,
    partnerCommission,
    adminEarning,
  });

  res.json({ success: true, record });
};
