import { PrismaClient, Role, RequestStatus, MessageType } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Cleanup existing data
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.rating.deleteMany()
    await prisma.swapRequest.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('🧹 Cleaned up existing data')

    // Create Admin User
    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@skswap.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            role: Role.ADMIN,
            bio: 'System Administrator',
            location: 'San Francisco, CA',
            profilePublic: true,
            availability: {
                create: [
                    { day: 'Weekdays', time: '9 AM - 5 PM' }
                ]
            }
        }
    })

    console.log(`👤 Created admin user: ${adminUser.name}`)

    // Create Account for Admin
    await prisma.account.create({
        data: {
            id: crypto.randomUUID(),
            userId: adminUser.id,
            providerId: "credential",
            accountId: "admin@skswap.com",
            password: "e9e329ca478f871bc12959e548055131:74c083ef568d55a7835b804e2ddda95652617a488f7777bcdd59b6d96ae786e7d79937489f589c40059b1f7fe28d4d3dba5930ac33270d1347bddfee4dc8ec40",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    })

    // Create Normal Users
    const usersData = [
        {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            bio: 'Graphic Designer with 5 years of experience. Love creating logos and branding.',
            location: 'New York, NY',
            skillsOffered: [
                { name: 'Graphic Design', category: 'Design', description: 'Logo design, branding, UI/UX' },
                { name: 'Adobe Photoshop', category: 'Design', description: 'Photo editing and manipulation' }
            ],
            skillsWanted: [
                { name: 'React', category: 'Development', description: 'Want to learn frontend development' },
                { name: 'Spanish', category: 'Language', description: 'Conversational Spanish' }
            ]
        },
        {
            name: 'Bob Smith',
            email: 'bob@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
            bio: 'Full Stack Developer. Passionate about teaching coding.',
            location: 'Austin, TX',
            skillsOffered: [
                { name: 'React', category: 'Development', description: 'Frontend development with React and Next.js' },
                { name: 'Node.js', category: 'Development', description: 'Backend API development' }
            ],
            skillsWanted: [
                { name: 'Graphic Design', category: 'Design', description: 'Need help with app designs' },
                { name: 'Cooking', category: 'Lifestyle', description: 'Want to learn Italian cooking' }
            ]
        },
        {
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
            bio: 'Professional Photographer. I capture moments.',
            location: 'Seattle, WA',
            skillsOffered: [
                { name: 'Photography', category: 'Art', description: 'Portrait and landscape photography' }
            ],
            skillsWanted: [
                { name: 'Video Editing', category: 'Art', description: 'Editing vlogs and tutorials' }
            ]
        },
        {
            name: 'Diana Prince',
            email: 'diana@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
            bio: 'Marketing Specialist. I help brands grow.',
            location: 'Chicago, IL',
            skillsOffered: [
                { name: 'Digital Marketing', category: 'Business', description: 'SEO, social media marketing' }
            ],
            skillsWanted: [
                { name: 'Photography', category: 'Art', description: 'Product photography for clients' }
            ]
        },
        {
            name: 'Evan Wright',
            email: 'evan@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan',
            bio: 'Guitarist and Music Teacher.',
            location: 'Nashville, TN',
            skillsOffered: [
                { name: 'Guitar', category: 'Music', description: 'Acoustic and electric guitar lessons' }
            ],
            skillsWanted: [
                { name: 'Digital Marketing', category: 'Business', description: 'Promoting my music classes' }
            ]
        },
        {
            name: 'Fiona Gallagher',
            email: 'fiona@example.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona',
            bio: 'Chef and Culinary Instructor.',
            location: 'Boston, MA',
            skillsOffered: [
                { name: 'Cooking', category: 'Lifestyle', description: 'Italian and French cuisine' }
            ],
            skillsWanted: [
                { name: 'Guitar', category: 'Music', description: 'Always wanted to play guitar' }
            ]
        }
    ]

    const createdUsers = []

    // 1. Create Users with Offered Skills
    for (const userData of usersData) {
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                emailVerified: true,
                image: userData.image,
                bio: userData.bio,
                location: userData.location,
                profilePublic: true,
                availability: {
                    create: [
                        { day: 'Weekends', time: 'Flexible' },
                        { day: 'Weekdays', time: 'Evenings' }
                    ]
                },
                skillsOffered: {
                    create: userData.skillsOffered
                }
            },
            include: {
                skillsOffered: true
            }
        })
        createdUsers.push(user)
        console.log(`👤 Created user: ${user.name}`)

        // Create Account for User
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                userId: user.id,
                providerId: "credential",
                accountId: userData.email,
                password: "e9e329ca478f871bc12959e548055131:74c083ef568d55a7835b804e2ddda95652617a488f7777bcdd59b6d96ae786e7d79937489f589c40059b1f7fe28d4d3dba5930ac33270d1347bddfee4dc8ec40",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
    }

    // 2. Connect Skills Wanted (Cross-pollinate)
    console.log('🔗 Connecting wanted skills...')

    const alice = createdUsers.find(u => u.email === 'alice@example.com')!
    const bob = createdUsers.find(u => u.email === 'bob@example.com')!
    const charlie = createdUsers.find(u => u.email === 'charlie@example.com')!
    const diana = createdUsers.find(u => u.email === 'diana@example.com')!
    const evan = createdUsers.find(u => u.email === 'evan@example.com')!
    const fiona = createdUsers.find(u => u.email === 'fiona@example.com')!

    // Alice wants React (Bob) and Spanish (No one offers Spanish explicitly in seed, let's skip or add to someone)
    // Let's just connect to available skills for simplicity
    if (bob.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: alice.id },
            data: {
                skillsWanted: {
                    connect: [{ id: bob.skillsOffered[0].id }] // React
                }
            }
        })
    }

    // Bob wants Graphic Design (Alice)
    if (alice.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: bob.id },
            data: {
                skillsWanted: {
                    connect: [{ id: alice.skillsOffered[0].id }] // Graphic Design
                }
            }
        })
    }

    // Charlie wants Video Editing (Not offered, let's connect to Digital Marketing from Diana)
    if (diana.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: charlie.id },
            data: {
                skillsWanted: {
                    connect: [{ id: diana.skillsOffered[0].id }] // Digital Marketing
                }
            }
        })
    }

    // Diana wants Photography (Charlie)
    if (charlie.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: diana.id },
            data: {
                skillsWanted: {
                    connect: [{ id: charlie.skillsOffered[0].id }] // Photography
                }
            }
        })
    }

    // Evan wants Digital Marketing (Diana)
    if (diana.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: evan.id },
            data: {
                skillsWanted: {
                    connect: [{ id: diana.skillsOffered[0].id }]
                }
            }
        })
    }

    // Fiona wants Guitar (Evan)
    if (evan.skillsOffered.length > 0) {
        await prisma.user.update({
            where: { id: fiona.id },
            data: {
                skillsWanted: {
                    connect: [{ id: evan.skillsOffered[0].id }]
                }
            }
        })
    }

    // Create Swaps
    console.log('🔄 Creating swaps...')

    // Alice (Graphic Design) <-> Bob (React) - COMPLETED

    const swap1 = await prisma.swapRequest.create({
        data: {
            fromUserId: alice.id,
            toUserId: bob.id,
            skillOfferedId: alice.skillsOffered[0].id, // Graphic Design
            skillWantedId: bob.skillsOffered[0].id,   // React
            status: RequestStatus.COMPLETED,
            message: "Hey Bob, I'd love to learn React in exchange for some design work!"
        }
    })

    // Bob <-> Alice Rating
    await prisma.rating.create({
        data: {
            rating: 5,
            comment: "Alice is a fantastic designer! Learned so much.",
            fromUserId: bob.id,
            toUserId: alice.id,
            swapId: swap1.id
        }
    })

    await prisma.rating.create({
        data: {
            rating: 5,
            comment: "Bob is a great teacher. React makes sense now!",
            fromUserId: alice.id,
            toUserId: bob.id,
            swapId: swap1.id
        }
    })

    // Charlie (Photography) -> Diana (Digital Marketing) - ACCEPTED

    const swap2 = await prisma.swapRequest.create({
        data: {
            fromUserId: charlie.id,
            toUserId: diana.id,
            skillOfferedId: charlie.skillsOffered[0].id, // Photography
            skillWantedId: diana.skillsOffered[0].id,   // Digital Marketing
            status: RequestStatus.ACCEPTED,
            message: "Hi Diana, interested in swapping photography for marketing tips?"
        }
    })

    // Create Conversation for Swap 2
    const convo1 = await prisma.conversation.create({
        data: {
            participants: {
                connect: [{ id: charlie.id }, { id: diana.id }]
            },
            swapRequestId: swap2.id,
            messages: {
                create: [
                    {
                        content: "Hi Diana, thanks for accepting!",
                        senderId: charlie.id,
                        type: MessageType.TEXT
                    },
                    {
                        content: "No problem Charlie! I really need some product photos.",
                        senderId: diana.id,
                        type: MessageType.TEXT
                    },
                    {
                        content: "Great! When are you free to meet?",
                        senderId: charlie.id,
                        type: MessageType.TEXT
                    }
                ]
            }
        }
    })

    // Evan (Guitar) -> Fiona (Cooking) - PENDING

    await prisma.swapRequest.create({
        data: {
            fromUserId: evan.id,
            toUserId: fiona.id,
            skillOfferedId: evan.skillsOffered[0].id, // Guitar
            skillWantedId: fiona.skillsOffered[0].id, // Cooking
            status: RequestStatus.PENDING,
            message: "Hi Fiona, I see you want to learn guitar. I'd love to learn some Italian recipes!"
        }
    })

    // Fiona -> Bob (React) - REJECTED
    await prisma.swapRequest.create({
        data: {
            fromUserId: fiona.id,
            toUserId: bob.id,
            skillOfferedId: fiona.skillsOffered[0].id, // Cooking
            skillWantedId: bob.skillsOffered[0].id,    // React
            status: RequestStatus.REJECTED,
            message: "Can you teach me to code?"
        }
    })

    console.log('✅ Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
