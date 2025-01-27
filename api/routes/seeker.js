import express from "express"
import 'dotenv/config';
import Seeker from "../models/seeker.model.js";
import jwt from 'jsonwebtoken';


const router = express.Router();


const getNextAvailableAppointment = async (department) => {
    const existingAppointments = await Seeker.find({ depart: department })
        .sort({ appointmentDateTime: 1 })
        .limit(1);

    let nextAvailableTime = new Date();

    if (existingAppointments.length > 0) {
        const latestAppointment = existingAppointments[0].appointmentDateTime;
        nextAvailableTime = new Date(latestAppointment.getTime() + 30 * 60 * 1000);
    }

    return nextAvailableTime;
}

router.get('/', async (req, res) => {
    try {
        const allSeeker = await Seeker.find();
        const totalSeeker = await Seeker.countDocuments()

        res.status(200).json({ msg: "Get All Seeker Successfully", seeker: allSeeker, totalSeeker });
    } catch (error) {
        res.status(500).json({ msg: "Error can't get all seeker", error: error.message });
    }
});


router.get('/metadata', async (req, res) => {
    try {
        const departments = [
            "Health Department",
            "Blood Bank",
            "Financial Aid",
            "Medical Assistance",
            "Education Support",
            "Food Distribution",
            "Job Training"
        ];

        const statuses = ["In Progress", "Completed", "Rejected"];

        res.status(200).json({ departments, statuses });
    } catch (error) {
        res.status(500).json({ msg: "Error fetching metadata", error: error.message });
    }
});


router.post('/register', async (req, res) => {
    const { cnic, name, phone, address, depart, purpose } = req.body;
    const appointmentDateTime = await getNextAvailableAppointment(depart);
    try {
        const newSeeker = new Seeker({
            cnic,
            name,
            phone,
            address,
            depart,
            purpose,
            appointmentDateTime,
        });
        await newSeeker.save();

        const token = jwt.sign({ cnic: newSeeker.cnic, id: newSeeker._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.status(200).json({ msg: "Seeker registered successfully", token, seeker: newSeeker });
    } catch (error) {
        res.status(500).json({ msg: "Error registering seeker", error: error.message });
    }
});


router.get("/depart-wise", async (req, res) => {
    try {
        const departmentCount = await Seeker.aggregate([
            // Step 1: Group by department and status
            {
                $group: {
                    _id: {
                        depart: "$depart",
                        status: "$status",
                    },
                    count: { $sum: 1 }, // Count the number of seekers in each group
                }
            },
            // Step 2: Unwind to separate department and status counts
            {
                $group: {
                    _id: "$_id.depart",
                    totalCount: { $sum: "$count" }, // Total count of seekers in each department
                    statuses: {
                        $push: {
                            status: "$_id.status",
                            count: "$count"
                        }
                    }
                }
            },
            // Step 3: Add a field for total department count
            {
                $project: {
                    department: "$_id",
                    totalCount: 1,
                    statuses: 1,
                    _id: 0,
                }
            },
            // Step 4: Match the desired departments (you can adjust this list as needed)
            {
                $match: {
                    department: {
                        $in: [
                            "Health Department",
                            "Blood Bank",
                            "Financial Aid",
                            "Medical Assistance",
                            "Education Support",
                            "Food Distribution",
                            "Job Training"
                        ]
                    }
                }
            }
        ]);

        res.status(200).json(departmentCount);
    } catch (error) {
        console.error('Error fetching department-wise data:', error);
        res.status(500).json({ msg: "Error fetching department-wise data", error: error.message });
    }
});


router.get('/search', async (req, res) => {
    try {
        const { searchTerm, department, status, date } = req.query;
        console.log(status)
        let query = {};

        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { cnic: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        if (department) {
            query.depart = department;
        }

        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            query.appointmentDateTime = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const seekers = await Seeker.find(query).sort({ appointmentDateTime: -1 });

        res.status(200).json({ seekers });
    } catch (error) {
        res.status(500).json({ msg: "Error searching records", error: error.message });
    }
});


router.put("/update-status", async (req, res) => {
    try {
        const { _id, status } = req.body;
        const updatedSeeker = await Seeker.findOneAndUpdate(
            { _id: _id }, // filter by seeker id
            { status: status }, // update the status field
            { new: true } // return the updated document
        );

        if (!updatedSeeker) {
            return res.status(404).json({ msg: "Seeker not found" });
        };

        res.status(200).json({ msg: "Seeker status updated", updatedSeeker });
    } catch (error) {
        res.status(500).json({ msg: "Error can't update seeker", error: error.message });
    }
});

export default router;