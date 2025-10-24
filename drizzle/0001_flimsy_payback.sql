CREATE TABLE `exercisePrograms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`durationMinutes` int NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`targetCondition` varchar(100),
	`instructions` text,
	`videoUrl` varchar(500),
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercisePrograms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eyeFatigueLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` timestamp NOT NULL,
	`timeOfDay` enum('morning','afternoon','evening') NOT NULL,
	`fatigueScore` int NOT NULL,
	`screenTime` int DEFAULT 0,
	`symptoms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eyeFatigueLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eyeSimulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simulationType` enum('myopia','hyperopia','astigmatism','fatigue') NOT NULL,
	`severity` int NOT NULL,
	`parameters` text,
	`imageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eyeSimulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eyeTestResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testType` enum('snellen','contrast','color','astigmatism','convergence','symptom') NOT NULL,
	`rightEyeScore` varchar(50),
	`leftEyeScore` varchar(50),
	`binocularScore` varchar(50),
	`rawData` text,
	`notes` text,
	`testDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eyeTestResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('trial','monthly','quarterly','yearly') NOT NULL,
	`durationDays` int NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`features` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userExerciseLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`durationMinutes` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userExerciseLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userEyeProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`age` int NOT NULL,
	`gender` enum('male','female','other'),
	`occupation` varchar(100),
	`dailyScreenTime` int DEFAULT 0,
	`dailyOutdoorTime` int DEFAULT 0,
	`sleepHours` int DEFAULT 7,
	`usesGlasses` int DEFAULT 0,
	`rightEyeDiopter` varchar(20),
	`leftEyeDiopter` varchar(20),
	`hasAstigmatism` int DEFAULT 0,
	`astigmatismDegree` varchar(20),
	`familyHistory` text,
	`lastEyeExam` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userEyeProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userEyeProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp NOT NULL,
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
