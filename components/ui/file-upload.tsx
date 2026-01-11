"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { File, Upload, X } from "lucide-react";

export function FileUpload({
	name,
	acceptedFileTypes,
	label,
	multiple,
}: {
	name: string;
	acceptedFileTypes: string;
	label: string;
	multiple?: boolean;
}) {
	const [files, setFiles] = useState<File[]>([]);
	const maxFiles = 5;
	const maxFileSize = 2 * 1024 * 1024; // 2MB

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files);

			if (multiple && files.length + newFiles.length > maxFiles) {
				alert(`You can only upload a maximum of ${maxFiles} files.`);
				return;
			}

			const oversizedFiles = newFiles.filter((file) => file.size > maxFileSize);
			if (oversizedFiles.length > 0) {
				alert(
					`File(s) ${oversizedFiles
						.map((f) => f.name)
						.join(", ")} exceed the 2MB size limit.`,
				);
				return;
			}

			const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
			setFiles(updatedFiles);
			updateInputFiles(updatedFiles);
		}
	};

	const updateInputFiles = (files: File[]) => {
		const input = document.getElementById(name) as HTMLInputElement;
		if (input) {
			const dataTransfer = new DataTransfer();
			files.forEach((file) => dataTransfer.items.add(file));
			input.files = dataTransfer.files;
		}
	};

	const handleRemoveFile = (index: number) => {
		const newFiles = files.filter((_, i) => i !== index);
		setFiles(newFiles);
		updateInputFiles(newFiles);
	};

	return (
		<div>
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium text-foreground">{label}</p>
				{files.length > 0 && multiple && (
					<Button
						variant="link"
						size="sm"
						onClick={() => {
							setFiles([]);
							updateInputFiles([]);
						}}
					>
						Clear All
					</Button>
				)}
			</div>

			<div className="mt-2 flex justify-center space-x-4 rounded-md border border-dashed border-input px-6 py-10">
				<div className="sm:flex sm:items-center sm:gap-x-3">
					<Upload
						className="mx-auto h-8 w-8 text-muted-foreground sm:mx-0 sm:h-6 sm:w-6"
						aria-hidden={true}
					/>
					<div className="mt-4 flex text-sm leading-6 text-foreground sm:mt-0">
						<p>Drag and drop or</p>
						<Label
							htmlFor={name}
							className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
						>
							<span>choose file(s)</span>
							<input
								id={name}
								name={name}
								type="file"
								className="sr-only"
								onChange={handleFileChange}
								accept={acceptedFileTypes}
								multiple={multiple}
							/>
						</Label>
						<p className="pl-1">to upload</p>
					</div>
				</div>
			</div>
			<p className="mt-2 flex items-center justify-between text-xs leading-5 text-muted-foreground">
				Max. {maxFiles} files, up to 2MB each.
			</p>

			{files.length > 0 && (
				<div className="mt-2 space-y-4">
					{files.map((file, index) => (
						<div key={index} className="relative rounded-lg bg-muted p-3">
							<div className="absolute right-1 top-1 flex">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="rounded-sm p-2 text-muted-foreground hover:text-foreground"
									aria-label="Remove"
									onClick={() => handleRemoveFile(index)}
								>
									<X className="size-4 shrink-0" aria-hidden={true} />
								</Button>
							</div>
							<div className="flex items-center space-x-2.5">
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-input">
									<File className="size-5 text-foreground" aria-hidden={true} />
								</span>
								<div className="w-full">
									<a
										href={URL.createObjectURL(file)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs font-medium text-foreground hover:underline"
									>
										{file.name}
									</a>
									<p className="mt-0.5 flex justify-between text-xs text-muted-foreground">
										<span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
