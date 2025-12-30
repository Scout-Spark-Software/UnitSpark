<section
    class="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white pt-32 pb-24 min-h-screen flex items-center overflow-hidden"
>
    <!-- Rising Sparks Background -->
    <div class="absolute inset-0 overflow-hidden">
        <!-- Sparks - Small -->
        <div class="spark spark-small spark-1"></div>
        <div class="spark spark-small spark-2"></div>
        <div class="spark spark-small spark-3"></div>
        <div class="spark spark-small spark-4"></div>
        <div class="spark spark-small spark-5"></div>
        <div class="spark spark-small spark-6"></div>
        <div class="spark spark-small spark-7"></div>
        <div class="spark spark-small spark-8"></div>

        <!-- Sparks - Medium -->
        <div class="spark spark-medium spark-9"></div>
        <div class="spark spark-medium spark-10"></div>
        <div class="spark spark-medium spark-11"></div>
        <div class="spark spark-medium spark-12"></div>
        <div class="spark spark-medium spark-13"></div>
        <div class="spark spark-medium spark-14"></div>

        <!-- Sparks - Large -->
        <div class="spark spark-large spark-15"></div>
        <div class="spark spark-large spark-16"></div>
        <div class="spark spark-large spark-17"></div>
        <div class="spark spark-large spark-18"></div>

        <!-- Sparks - Tiny (embers) -->
        <div class="spark spark-tiny spark-19"></div>
        <div class="spark spark-tiny spark-20"></div>
        <div class="spark spark-tiny spark-21"></div>
        <div class="spark spark-tiny spark-22"></div>
        <div class="spark spark-tiny spark-23"></div>
        <div class="spark spark-tiny spark-24"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1
            class="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in"
        >
            Empowering Scouting Adventures
        </h1>
        <p
            class="text-xl md:text-2xl mb-12 opacity-95 leading-relaxed max-w-3xl mx-auto"
        >
            Complete solutions for hiking, camping, and unit management to make
            every scouting experience unforgettable
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
            <a
                href="#adventures"
                class="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
                Explore Products
            </a>
        </div>
    </div>
</section>

<style>
    /* Fade in animation for heading */
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 1s ease-out;
    }

    /* Sparks styling */
    .spark {
        position: absolute;
        background: radial-gradient(circle, #ffd700, #ffa500);
        border-radius: 50%;
        opacity: 0;
    }

    .spark-tiny {
        width: 1.5px;
        height: 1.5px;
        box-shadow: 0 0 2px #ffa500;
    }

    .spark-small {
        width: 2.5px;
        height: 2.5px;
        box-shadow: 0 0 3px #ffa500;
    }

    .spark-medium {
        width: 4px;
        height: 4px;
        box-shadow: 0 0 5px #ffa500;
    }

    .spark-large {
        width: 6px;
        height: 6px;
        box-shadow: 0 0 8px #ffa500;
    }

    /* Rising spark animation */
    @keyframes rise {
        0% {
            opacity: 0;
            transform: translateY(0) translateX(0) scale(1);
        }
        10% {
            opacity: 0.8;
        }
        50% {
            opacity: 0.6;
        }
        90% {
            opacity: 0.2;
        }
        100% {
            opacity: 0;
            transform: translateY(-600px) translateX(var(--drift)) scale(0.3);
        }
    }

    /* Individual spark positions and animations */
    .spark-1 {
        bottom: 10%;
        left: 15%;
        animation: rise 8s ease-out infinite;
        --drift: 20px;
    }

    .spark-2 {
        bottom: 5%;
        left: 25%;
        animation: rise 9s ease-out 1s infinite;
        --drift: -15px;
    }

    .spark-3 {
        bottom: 8%;
        left: 45%;
        animation: rise 10s ease-out 2s infinite;
        --drift: 25px;
    }

    .spark-4 {
        bottom: 12%;
        left: 65%;
        animation: rise 7.5s ease-out 0.5s infinite;
        --drift: -20px;
    }

    .spark-5 {
        bottom: 6%;
        left: 80%;
        animation: rise 8.5s ease-out 1.5s infinite;
        --drift: 15px;
    }

    .spark-6 {
        bottom: 15%;
        left: 35%;
        animation: rise 9.5s ease-out 3s infinite;
        --drift: -25px;
    }

    .spark-7 {
        bottom: 8%;
        left: 55%;
        animation: rise 8s ease-out 2.5s infinite;
        --drift: 18px;
    }

    .spark-8 {
        bottom: 10%;
        left: 72%;
        animation: rise 7s ease-out 1.8s infinite;
        --drift: -12px;
    }

    .spark-9 {
        bottom: 7%;
        left: 90%;
        animation: rise 9s ease-out 3.5s infinite;
        --drift: 22px;
    }

    .spark-10 {
        bottom: 11%;
        left: 5%;
        animation: rise 8.8s ease-out 0.8s infinite;
        --drift: -18px;
    }

    .spark-11 {
        bottom: 9%;
        left: 50%;
        animation: rise 7.8s ease-out 2.2s infinite;
        --drift: 16px;
    }

    .spark-12 {
        bottom: 13%;
        left: 40%;
        animation: rise 9.2s ease-out 3.2s infinite;
        --drift: -22px;
    }

    .spark-13 {
        bottom: 6%;
        left: 60%;
        animation: rise 8.3s ease-out 1.2s infinite;
        --drift: 20px;
    }

    .spark-14 {
        bottom: 14%;
        left: 78%;
        animation: rise 7.5s ease-out 2.8s infinite;
        --drift: -17px;
    }

    .spark-15 {
        bottom: 10%;
        left: 20%;
        animation: rise 9.5s ease-out 0.5s infinite;
        --drift: 25px;
    }

    .spark-16 {
        bottom: 12%;
        left: 85%;
        animation: rise 8.2s ease-out 2s infinite;
        --drift: -20px;
    }

    .spark-17 {
        bottom: 8%;
        left: 30%;
        animation: rise 7.8s ease-out 3.5s infinite;
        --drift: 18px;
    }

    .spark-18 {
        bottom: 11%;
        left: 68%;
        animation: rise 9s ease-out 1.5s infinite;
        --drift: -23px;
    }

    .spark-19 {
        bottom: 5%;
        left: 12%;
        animation: rise 7.2s ease-out 0.3s infinite;
        --drift: 12px;
    }

    .spark-20 {
        bottom: 9%;
        left: 48%;
        animation: rise 8.5s ease-out 2.5s infinite;
        --drift: -14px;
    }

    .spark-21 {
        bottom: 7%;
        left: 75%;
        animation: rise 7.8s ease-out 1.8s infinite;
        --drift: 16px;
    }

    .spark-22 {
        bottom: 13%;
        left: 8%;
        animation: rise 8.8s ease-out 3s infinite;
        --drift: -19px;
    }

    .spark-23 {
        bottom: 6%;
        left: 52%;
        animation: rise 7.5s ease-out 0.8s infinite;
        --drift: 21px;
    }

    .spark-24 {
        bottom: 10%;
        left: 95%;
        animation: rise 8.2s ease-out 2.3s infinite;
        --drift: -15px;
    }
</style>
