const express = require('express');
const router = express.Router();
var fetchUser= require('../middleware/fetchuser')
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Question')


router.get('/fetchallnotes',fetchUser,async(req,res)=>{
    try{
        
        const notes =await Notes.find({user:req.user.id})
        res.json(notes)
    }catch(error){
        console.error(error.message);
        res.status(500).send("backend ki error")
    }
})


 
router.put('/updatenote/:id',fetchUser,async(req,res)=>{
    const {title,discription}=req.body;
    // debugger
    const newNote={}
    if(title){newNote.title=title}
    if(discription){newNote.discription=discription}    

    let note =await Notes.findById(req.params.id);
    // console.log(note);
    if(!note){return res.status(404).send('not found')}
    if (note.user!=req.user.id){
        return res.status(401).send('Hacker')
    }
    note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})

})


router.post('/note', fetchUser, async (req, res) => {
    try {
        const { homeCurrent, voltage, question } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let note;
        if (req.query.id) { // update note
            note = await Notes.findById(req.query.id);
            if (!note) {
                return res.status(404).json({ msg: 'Note not found' });
            }
            if (note.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            note.homeCurrent = homeCurrent;
            note.voltage = voltage;
            note.question = question;
        } else { // create note
            note = new Notes({
                homeCurrent,
                voltage,
                question,
                user: req.user.id
            });
        }
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error in saving note');
    }
});


module.exports= router;