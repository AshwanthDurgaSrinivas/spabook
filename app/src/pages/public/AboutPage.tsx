
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, CheckCircle, Users, Award, Clock, Heart, Sparkles, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ y }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
                        alt="Spa Background"
                        className="w-full h-full object-cover brightness-50"
                    />
                </motion.div>
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-display font-bold mb-6"
                    >
                        Wellness Redefined
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl max-w-2xl mx-auto font-light mb-8"
                    >
                        A sanctuary for your mind, body, and soul.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link to="/contact">
                            <Button className="gradient-coral text-white rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                                Connect With Us
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-50 border border-coral-100/50 mb-6">
                            <Sparkles className="w-4 h-4 text-coral-500 fill-coral-500" />
                            <span className="text-sm font-medium text-coral-700">Established 2010</span>
                        </div>
                        <h2 className="text-4xl font-display font-bold mb-6 text-gray-900">Our Story</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Founded in 2010, Sparkle Beauty Lounge began with a simple mission: to create a space where beauty meets tranquility.
                            We believe that self-care is not a luxury, but a necessity in today's fast-paced world.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Our team of expert therapists and stylists are dedicated to providing personalized treatments
                            tailored to your unique needs. From our carefully curated products to our serene environment,
                            every detail is designed to enhance your well-being.
                        </p>
                        <div className="flex gap-12">
                            <div>
                                <h4 className="text-3xl font-bold text-coral-500">10+</h4>
                                <p className="text-gray-500 text-sm">Years Experience</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-coral-500">15k+</h4>
                                <p className="text-gray-500 text-sm">Happy Clients</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-coral-500">25+</h4>
                                <p className="text-gray-500 text-sm">Expert Staff</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
                                alt="Our Spa"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl max-w-xs animate-float hidden md:block">
                            <div className="flex gap-1 text-yellow-400 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                            </div>
                            <p className="font-bold text-gray-900 text-lg">"The best spa experience I've ever had!"</p>
                            <p className="text-gray-500 text-sm mt-2">- Emily R.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why We Do It */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">Our Philosophy</h2>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            "We believe that true beauty comes from within. Our treatments are designed not just to enhance your physical appearance, but to nourish your spirit and restore balance to your life."
                        </p>
                    </div>
                </div>
            </section>


            {/* Core Values */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold mb-4 text-gray-900">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Principles that guide our service and commitment to you.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Award,
                                title: "Excellence",
                                desc: "We strive for perfection in every treatment and interaction."
                            },
                            {
                                icon: Users,
                                title: "Community",
                                desc: "Building lasting relationships with our clients and staff."
                            },
                            {
                                icon: CheckCircle,
                                title: "Integrity",
                                desc: "Honest, transparent, and ethical in everything we do."
                            },
                            {
                                icon: Clock,
                                title: "Reliability",
                                desc: "Consistently delivering high-quality experiences every time."
                            }
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lg transition-shadow text-center group"
                            >
                                <div className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center text-coral-500 mx-auto mb-6 group-hover:bg-coral-500 group-hover:text-white transition-colors duration-300">
                                    <value.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-gray-900">{value.title}</h3>
                                <p className="text-gray-600">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-bold mb-4 text-gray-900">Meet Our Experts</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">The talented professionals behind your transformation.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah Johnson", role: "Senior Therapist", spec: "Deep Tissue & Healing", img: "1580489944761-15a19d654956" },
                        { name: "Michael Chang", role: "Massage Therapist", spec: "Sports & Recovery", img: "1573496359142-b8d87734a5a2" },
                        { name: "Emma Davis", role: "Holistic Healer", spec: "Aromatherapy & Stone", img: "1595152772835-219674b2a8a6" }
                    ].map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group relative overflow-hidden rounded-3xl aspect-[3/4] shadow-lg"
                        >
                            <img
                                src={`https://images.unsplash.com/photo-${member.img}?q=80&w=1000&auto=format&fit=crop`}
                                alt={member.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                                <p className="text-coral-300 font-medium mb-2">{member.role}</p>
                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                                    <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{member.spec}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Visit Us CTA */}
            <section className="py-24 bg-peach-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-8">Come Visit Our Sanctuary</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <MapPin className="w-8 h-8 text-coral-500 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Location</h3>
                            <p className="text-gray-600">123 Beauty Lane, Suite 100<br />New York, NY 10001</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <Phone className="w-8 h-8 text-coral-500 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
                            <p className="text-gray-600">+1 (555) 123-4567<br />hello@sparklelounge.com</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <Clock className="w-8 h-8 text-coral-500 mx-auto mb-4" />
                            <h3 className="font-bold text-gray-900 mb-2">Hours</h3>
                            <p className="text-gray-600">Mon-Fri: 9am - 8pm<br />Sat-Sun: 10am - 6pm</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
