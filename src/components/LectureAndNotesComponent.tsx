import React, { useContext, useEffect, useState } from "react";

import { AuthContextHolder } from "../api/bsf/AuthContext";
import { MaterialsDownloadRequest } from "../api/bsf/requests/MaterialsDownloadRequest";
import { MaterialsRequest } from "../api/bsf/requests/MaterialsRequest";

interface LectureAndNotesProps {
    lessonId: number;
}

interface FilteredMaterial {
    name: string;
    materialId: number;
    url: string;
}

const LectureAndNotesComponent: React.FC<LectureAndNotesProps> = ({
    lessonId,
}) => {
    // const settings = useContext(SettingsContext);

    const [materials, setMaterials] = useState<FilteredMaterial[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (lessonId) {
            const fetchMaterials = async () => {
                const materialsRequest = new MaterialsRequest(
                    AuthContextHolder.getAuthContext(),
                    lessonId
                );
                try {
                    const materialsResponse =
                        await materialsRequest.makeRequest();

                    // Filter out the materials that aren't lectures or HTML notes
                    const filteredMaterials: FilteredMaterial[] = [];
                    for (const material of materialsResponse) {
                        if (
                            material.materialCategoryId === 2 &&
                            material.materialTypeId === 1 &&
                            material.materialFileTypeId === 1 &&
                            material.fileLocationUrl
                                .toLocaleLowerCase()
                                .endsWith(".html")
                        ) {
                            const name = material.translations[0].name;
                            const downloadRequest =
                                new MaterialsDownloadRequest(
                                    AuthContextHolder.getAuthContext(),
                                    material.materialId
                                );
                            const url = (await downloadRequest.makeRequest())
                                .url;
                            const materialId = material.materialId;

                            filteredMaterials.push({ name, materialId, url });
                        }
                    }

                    setMaterials(filteredMaterials);
                } catch (error) {
                    console.error("Failed to fetch materials", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchMaterials();
        }
    }, [lessonId]);

    if (loading) {
        return <div>Loading materials...</div>;
    }

    if (!materials.length) {
        return <div>No materials found.</div>;
    }

    return (
        <div className="lecture-and-notes-area">
            <h3>Materials</h3>
            {materials.map((material) => (
                <div key={material.materialId}>
                    <a href={material.url} target="_blank" rel="noreferrer">
                        {material.name}
                    </a>
                    <iframe
                        src={material.url}
                        title={material.name}
                        width="100%"
                        height="500px"
                    ></iframe>
                </div>
            ))}
        </div>
    );
};

export default LectureAndNotesComponent;
