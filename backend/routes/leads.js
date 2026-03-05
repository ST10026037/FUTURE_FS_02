const express = require("express");
const Lead = require("../models/Lead");
const requireAuth = require("../middleware/auth");

const router = express.Router();

/**
 * PUBLIC: create a lead (this simulates a website contact form submission)
 * POST /api/leads
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, source, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const lead = await Lead.create({
      name,
      email,
      phone: phone || "",
      source: source || "Website Contact Form",
      message: message || "",
    });

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: "Failed to create lead." });
  }
});

/**
 * ADMIN: list all leads
 * GET /api/leads
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch {
    res.status(500).json({ message: "Failed to fetch leads." });
  }
});

/**
 * ADMIN: update lead status
 * PATCH /api/leads/:id/status
 */
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["new", "contacted", "converted", "lost"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Lead not found." });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update status." });
  }
});

/**
 * ADMIN: add a note
 * POST /api/leads/:id/notes
 */
router.post("/:id/notes", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Note text is required." });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found." });

    lead.notes.unshift({ text: text.trim() });
    await lead.save();

    res.json(lead);
  } catch {
    res.status(500).json({ message: "Failed to add note." });
  }
});

/**
 * ADMIN: delete a lead
 * DELETE /api/leads/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Lead not found." });
    res.json({ message: "Lead deleted.", id: req.params.id });
  } catch {
    res.status(500).json({ message: "Failed to delete lead." });
  }
});

module.exports = router;