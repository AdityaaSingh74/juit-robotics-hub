import { motion } from "framer-motion";
import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// Equipment images from assets/equipments folder
import jetsonNanoImg from "@/assets/equipments/nano.png";
import jetsonOrinNanoImg from "@/assets/equipments/orin-nano.png";
import raspberry5Img from "@/assets/equipments/rasp5.png";
import raspberry4bImg from "@/assets/equipments/rasp4b.png";
import arduinosImg from "@/assets/equipments/arduinos.png";
import aiCamImg from "@/assets/equipments/aicam.png";
import aiHatImg from "@/assets/equipments/AIHAT.png";
import realSenseImg from "@/assets/equipments/realSense.png";
import raspCamImg from "@/assets/equipments/raspCam.png";
import lidarImg from "@/assets/equipments/LIDAR.png";
import ydLidarImg from "@/assets/equipments/YDLIDAR.png";
import roboDogImg from "@/assets/equipments/robodog.png";
import thorKitImg from "@/assets/equipments/thor-kit.png";
import protoMEImg from "@/assets/equipments/protoME.png";
import protoVEImg from "@/assets/equipments/protoVE.png";
import dellImg from "@/assets/equipments/dell.png";
import gigaWifiImg from "@/assets/equipments/gigawifi.png";

interface Equipment {
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

const EquipmentShowcase = () => {
  const [api, setApi] = useState<any>();

  const equipment: Equipment[] = [
    {
      title: "NVIDIA Jetson Nano",
      category: "Edge AI Computing",
      description:
        "Compact AI computer with 128-core Maxwell GPU, quad-core ARM A57 CPU, 4GB LPDDR4 RAM. Runs multiple neural networks in parallel for applications like image classification, object detection, segmentation, and speech processing. Power-efficient platform for AI inference at the edge.",
      image: jetsonNanoImg,
      imageAlt: "NVIDIA Jetson Nano Development Kit",
    },
    {
      title: "NVIDIA Jetson Orin Nano",
      category: "Edge AI Computing",
      description:
        "Next-gen AI computer delivering up to 40 TOPS of AI performance with NVIDIA Ampere GPU architecture. Features 6-core Arm Cortex-A78AE CPU, 8GB LPDDR5 RAM. Supports modern AI networks and frameworks for robotics, smart cameras, and intelligent edge devices.",
      image: jetsonOrinNanoImg,
      imageAlt: "NVIDIA Jetson Orin Nano",
    },
    {
      title: "Raspberry Pi 5",
      category: "Single-Board Computer",
      description:
        "Latest flagship with 2.4GHz quad-core Arm Cortex-A76 CPU, VideoCore VII GPU supporting OpenGL ES 3.1 and Vulkan 1.2. Features dual 4Kp60 HDMI display output, PCIe 2.0 interface, dual-band 802.11ac WiFi, Gigabit Ethernet. Perfect for robotics control and AI projects.",
      image: raspberry5Img,
      imageAlt: "Raspberry Pi 5",
    },
    {
      title: "Raspberry Pi 4 Model B",
      category: "Single-Board Computer",
      description:
        "Powerful SBC with 1.5GHz quad-core Cortex-A72 CPU, up to 8GB LPDDR4 RAM. Dual micro-HDMI ports supporting 4K displays, Gigabit Ethernet, dual-band WiFi, Bluetooth 5.0. Versatile platform for robotics controllers, IoT gateways, and computer vision applications.",
      image: raspberry4bImg,
      imageAlt: "Raspberry Pi 4 Model B",
    },
    {
      title: "Arduino Development Boards",
      category: "Microcontroller Platform",
      description:
        "Collection of Arduino boards including Uno R3, Mega, Nano for prototyping. Open-source electronics platform with easy-to-use hardware and software. Ideal for sensor integration, motor control, and rapid development of robotics projects with extensive library support.",
      image: arduinosImg,
      imageAlt: "Arduino Development Boards",
    },
    {
      title: "Intel RealSense Depth Camera",
      category: "3D Vision Sensor",
      description:
        "Stereo depth camera with up to 1280x720 resolution at 90fps. Provides accurate depth perception up to 10 meters with infrared projector for low-light conditions. Essential for obstacle avoidance, 3D mapping, gesture recognition, and autonomous navigation in robotics.",
      image: realSenseImg,
      imageAlt: "Intel RealSense Depth Camera",
    },
    {
      title: "AI Camera Module",
      category: "Computer Vision",
      description:
        "High-resolution camera module with built-in AI acceleration for real-time image processing. Supports object detection, tracking, and recognition at the edge. Low-latency video streaming with hardware-accelerated encoding for robotics vision applications.",
      image: aiCamImg,
      imageAlt: "AI Camera Module",
    },
    {
      title: "Raspberry Pi AI HAT+",
      category: "AI Accelerator",
      description:
        "Neural network accelerator add-on board for Raspberry Pi featuring 13 TOPS of AI performance. Hailo-8L AI processor enables efficient on-device machine learning inference for computer vision, natural language processing, and sensor fusion applications.",
      image: aiHatImg,
      imageAlt: "Raspberry Pi AI HAT+",
    },
    {
      title: "Raspberry Pi Camera Module",
      category: "Vision Sensor",
      description:
        "Official camera module with Sony IMX sensor delivering high-quality images and video. Supports various resolutions and frame rates via CSI interface. Low power consumption, compact design ideal for mobile robots, surveillance, and computer vision research.",
      image: raspCamImg,
      imageAlt: "Raspberry Pi Camera Module",
    },
    {
      title: "RPLIDAR A1 360° Laser Scanner",
      category: "2D LiDAR",
      description:
        "Low-cost 2D laser scanner with 12-meter range and 360° scanning coverage. 8000 samples per second at 5.5Hz rotation speed. Provides accurate distance measurements for SLAM, navigation, obstacle avoidance, and environment mapping in indoor robotics.",
      image: lidarImg,
      imageAlt: "RPLIDAR A1 Laser Scanner",
    },
    {
      title: "YDLIDAR X4 360° Scanner",
      category: "2D LiDAR",
      description:
        "Compact triangulation-based laser rangefinder with 10-meter range and 5kHz sampling rate. 360° scanning at 6Hz for real-time mapping. ROS compatible with low power consumption, perfect for mobile robots, AGVs, and autonomous navigation systems.",
      image: ydLidarImg,
      imageAlt: "YDLIDAR X4 Scanner",
    },
    {
      title: "Unitree Go2 Quadruped Robot",
      category: "Bio-Inspired Robotics",
      description:
        "Advanced quadruped robot with 4D LIDAR for 360° terrain recognition. Features intelligent side-follow system, 3D LiDAR mapping, adaptive locomotion with roll-over and obstacle climbing capabilities. 8000mAh battery, supports autonomous path planning and complex terrain navigation.",
      image: roboDogImg,
      imageAlt: "Unitree Go2 Quadruped Robot",
    },
    {
      title: "THOR Humanoid Robot Kit",
      category: "Humanoid Robotics",
      description:
        "Open-source humanoid robot platform with 17+ DOF for research and education. Features high-precision servo motors, real-time motion control, and programmable behaviors. Supports Python and ROS integration for gait planning, balance control, and human-robot interaction studies.",
      image: thorKitImg,
      imageAlt: "THOR Humanoid Robot Kit",
    },
    {
      title: "Proto Shield - Mechanical Edition",
      category: "Prototyping",
      description:
        "Universal prototyping shield with mechanical mounting options for sensors and actuators. Features standard pin headers, screw terminals, and mounting holes. Enables rapid hardware prototyping and testing for robotics projects with Arduino and Raspberry Pi.",
      image: protoMEImg,
      imageAlt: "Proto Shield Mechanical Edition",
    },
    {
      title: "Proto Shield - Vertical Edition",
      category: "Prototyping",
      description:
        "Vertical prototyping board for space-efficient circuit development. Compatible with standard development boards, features through-hole pads for custom circuitry. Ideal for sensor integration, motor driver circuits, and power management in compact robotics applications.",
      image: protoVEImg,
      imageAlt: "Proto Shield Vertical Edition",
    },
    {
      title: "Dell Workstation",
      category: "Computing Infrastructure",
      description:
        "High-performance workstation for AI model training, simulation, and data processing. Multi-core processor with professional GPU acceleration. Large RAM capacity and fast storage for running complex robotics simulations, deep learning frameworks, and development environments.",
      image: dellImg,
      imageAlt: "Dell Workstation",
    },
    {
      title: "Gigabit WiFi Router",
      category: "Networking",
      description:
        "High-speed dual-band WiFi router with Gigabit Ethernet ports for reliable wireless connectivity. Low-latency communication essential for real-time robot control, teleoperation, sensor data streaming, and multi-robot coordination in lab environment.",
      image: gigaWifiImg,
      imageAlt: "Gigabit WiFi Router",
    },
  ];

  return (
    <section id="equipment" className="py-24 bg-secondary/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title gold-underline inline-block">Our Facilities</h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            State-of-the-art robotics equipment available for innovative research and learning
          </p>
        </motion.div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent>
            {equipment.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-2"
                >
                  <div className="bg-card rounded-xl shadow-lg overflow-hidden h-full flex flex-col card-hover">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      {/* REPLACE: Equipment image above if needed */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default EquipmentShowcase;
